// AIGC metadata (隐式标识) for the raster pipeline. Zero dependencies.
//
// Generated images carry the provider's implicit AI-content label in their metadata: a PNG `eXIf` chunk
// (the four legacy PNGs: TIFF/EXIF with ImageDescription = {"AIGC":{...}} and a UserComment with the
// signed TC260 payload), a JPEG APP1 Exif or XMP segment, or a PNG text chunk. ImageMagick's `-strip`
// throws all of that away, so the pipeline strips (for byte-stable output) and then splices the source's
// AIGC metadata back into the JPEG as APP1 segments.
//
//   readAigc(buf)            -> { exif: Buffer|null, xmp: Buffer|null } found in a PNG or JPEG file
//   aigcExif(json)           -> minimal big-endian EXIF (ImageDescription = json) for sources without one
//   insertApp1(jpeg, meta)   -> JPEG with Exif / XMP APP1 segments inserted after SOI (+ JFIF APP0)
//   jpegAigc(jpeg)           -> the AIGC text found in the JPEG's APP1 segments, or null
import zlib from 'node:zlib';

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const EXIF_HDR = Buffer.from('Exif\0\0', 'latin1');
const XMP_HDR = Buffer.from('http://ns.adobe.com/xap/1.0/\0', 'latin1');
const has = (buf) => buf && buf.includes('AIGC');

function pngChunks(buf) {
  const out = [];
  for (let i = 8; i + 8 <= buf.length;) {
    const len = buf.readUInt32BE(i), type = buf.toString('latin1', i + 4, i + 8);
    out.push({ type, data: buf.subarray(i + 8, i + 8 + len) });
    i += 12 + len;
    if (type === 'IEND') break;
  }
  return out;
}

function jpegSegments(buf) {
  const out = [];
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  for (let i = 2; i + 4 <= buf.length;) {
    if (buf[i] !== 0xff) throw new Error(`bad JPEG marker at ${i}`);
    const marker = buf[i + 1];
    if (marker === 0xd9 || marker === 0xda) { out.push({ marker, start: i, end: buf.length }); break; } // EOI / SOS: entropy data follows
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    out.push({ marker, start: i, end: i + 2 + len, data: buf.subarray(i + 4, i + 2 + len) });
    i += 2 + len;
  }
  return out;
}

// XMP / AIGC text from a PNG text chunk (tEXt, zTXt, iTXt)
function pngText({ type, data }) {
  const nul = data.indexOf(0);
  if (nul < 0) return null;
  const key = data.toString('latin1', 0, nul);
  if (type === 'tEXt') return { key, text: data.subarray(nul + 1) };
  if (type === 'zTXt') return { key, text: zlib.inflateSync(data.subarray(nul + 2)) };
  if (type === 'iTXt') {
    const compressed = data[nul + 1];
    let p = nul + 3;
    p = data.indexOf(0, p) + 1; // language tag
    p = data.indexOf(0, p) + 1; // translated keyword
    const body = data.subarray(p);
    return { key, text: compressed ? zlib.inflateSync(body) : body };
  }
  return null;
}

/** AIGC metadata of a PNG or JPEG file: raw TIFF/EXIF bytes and/or an XMP packet (only when they mention AIGC) */
export function readAigc(buf) {
  let exif = null, xmp = null, text = null;
  if (buf.subarray(0, 8).equals(PNG_SIG)) {
    for (const c of pngChunks(buf)) {
      if (c.type === 'eXIf' && has(c.data)) exif = Buffer.from(c.data);
      else if (c.type === 'tEXt' || c.type === 'zTXt' || c.type === 'iTXt') {
        const t = pngText(c);
        if (!t || !has(t.text)) continue;
        if (t.key === 'XML:com.adobe.xmp') xmp = Buffer.from(t.text);
        else text = t.text.toString('utf8');
      }
    }
  } else {
    for (const s of jpegSegments(buf)) {
      if (s.marker !== 0xe1 || !s.data) continue;
      if (s.data.subarray(0, 6).equals(EXIF_HDR) && has(s.data)) exif = Buffer.from(s.data.subarray(6));
      else if (s.data.subarray(0, XMP_HDR.length).equals(XMP_HDR) && has(s.data)) xmp = Buffer.from(s.data.subarray(XMP_HDR.length));
    }
  }
  if (!exif && !xmp && text) exif = aigcExif(text.trim());
  return { exif, xmp };
}

/** minimal big-endian TIFF/EXIF block with one IFD0 entry: ImageDescription (ASCII) = text */
export function aigcExif(text) {
  const str = Buffer.concat([Buffer.from(String(text), 'utf8'), Buffer.from([0])]);
  const head = Buffer.alloc(8 + 2 + 12 + 4);
  head.write('MM', 0, 'latin1');
  head.writeUInt16BE(42, 2);
  head.writeUInt32BE(8, 4); // IFD0 offset
  head.writeUInt16BE(1, 8); // one entry
  head.writeUInt16BE(0x010e, 10); // ImageDescription
  head.writeUInt16BE(2, 12); // ASCII
  head.writeUInt32BE(str.length, 14);
  head.writeUInt32BE(head.length, 18); // value offset (right after the IFD)
  head.writeUInt32BE(0, 22); // no next IFD
  return Buffer.concat([head, str]);
}

function app1(header, body) {
  const len = 2 + header.length + body.length;
  if (len > 0xffff) throw new Error(`APP1 segment too large (${len} bytes)`);
  const m = Buffer.from([0xff, 0xe1, len >> 8, len & 0xff]);
  return Buffer.concat([m, header, body]);
}

/** insert Exif / XMP APP1 segments into a JPEG (after SOI and the JFIF APP0, if any); existing APP1s are dropped */
export function insertApp1(jpeg, { exif = null, xmp = null } = {}) {
  const segs = jpegSegments(jpeg);
  const keep = [];
  let at = 2;
  for (const s of segs) {
    if (s.marker === 0xe0 && at === s.start) at = s.end;
    if (s.marker === 0xe1) continue;
    keep.push(s);
  }
  const head = jpeg.subarray(0, at);
  const rest = Buffer.concat(keep.filter((s) => s.start >= at).map((s) => jpeg.subarray(s.start, s.end)));
  const meta = [exif && app1(EXIF_HDR, exif), xmp && app1(XMP_HDR, xmp)].filter(Boolean);
  return Buffer.concat([head, ...meta, rest]);
}

/** the AIGC payload text found in a JPEG's APP1 segments (EXIF or XMP), or null */
export function jpegAigc(jpeg) {
  for (const s of jpegSegments(jpeg)) {
    if (s.marker !== 0xe1 || !s.data || !has(s.data)) continue;
    const text = s.data.toString('utf8');
    const i = text.indexOf('{"AIGC"');
    if (i < 0) return text;
    const end = text.indexOf('\0', i);
    return text.slice(i, end < 0 ? undefined : end);
  }
  return null;
}

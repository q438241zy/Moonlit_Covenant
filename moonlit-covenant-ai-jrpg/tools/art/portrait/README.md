# Portrait generator · `tools/art/portrait/`

Parametric, zero-dependency generator for the heroine bust portraits and costume portraits of
《月蚀契约：她们会记得你》. One shared template (canvas, body, head, face, lighting) plus one
small module per heroine and one per outfit. Every heroine × outfit pair renders as one
consistent, cel-shaded anime-style vector set.

```
npm run art:portraits                                   # build everything
node tools/art/portrait/build.mjs --only lia,mia        # some heroines
node tools/art/portrait/build.mjs --outfits maid        # some outfits
node tools/art/portrait/build.mjs --no-costumes         # portraits only
node tools/art/portrait/build.mjs --lenient --verbose   # keep going past a throwing layer, print stacks
```

| Output | Path | Budget |
|---|---|---|
| portrait | `public/assets/portraits/<heroineId>.svg` | ≤ 70 KB |
| costume portrait | `public/assets/costumes/<heroineId>_<outfitType>.svg` | ≤ 80 KB |

Rules for everything drawn here: `docs/ART-DIRECTION.md` (mandatory) and the character canon
(`docs/CHARACTER-DESIGN.md`, `设定集/03_主角与八位女主角.md`). All heroines are drawn as clearly
**adult women (age-appearance 20+), non-sexualised and modestly dressed** – this overrides any
younger ages or suggestive wording in game data. "Summer" outfits are resort clothes, not swimwear.

---

## 1. Files

| File | Role | Who edits |
|---|---|---|
| `base.mjs` | template + composer + drawing helpers | **nobody but the template owner** – modules must not need changes here |
| `build.mjs` | loads every `heroines/*.mjs` and `outfits/*.mjs`, writes the SVGs, checks hygiene | template owner |
| `heroines/<id>.mjs` | one heroine: palette, expression, layer functions | heroine authors |
| `outfits/<type>.mjs` | one outfit, worn by every heroine | outfit authors |

`heroines/lia.mjs` is the **reference implementation** – read it before writing a heroine.

The build imports modules dynamically. A module that fails to import, lacks `id` (heroine) or
`type`/`render` (outfit), or whose layer throws is logged and **that file is skipped** (never
written half-drawn). The build also warns about: forbidden markup (`<script>`, `<text>`,
`<image>`, `<foreignObject>`, event attributes, external `href`, fonts), missing viewBox,
duplicate ids, ids without the file prefix, more than 4 `<filter>`s, and size over budget.

---

## 2. Canvas, layout, drawing order

`viewBox="0 0 832 1216"`, no width/height. Centre line `x = 416`. Head top ≈ y172, eye line
y440, chin y615, shoulders ≈ y776–850, bust continues to the bottom edge. Light: **moonlight
from the upper-left** (`#e8ddff`), so every element shades its **right / lower** side; the
template adds the heroine's `accent` as a rim light on right-facing silhouette edges.

`compose(heroine, { outfit })` emits, in this order (template-drawn parts in *italics*):

1. *background*: vertical gradient (`bgTop → bgMid → bgBottom`), soft `accent` glow behind the head,
   faint stars → **`bgMotif`** → *background bottom fade*
2. figure group:
   1. **`hairBack`** – hair behind head/body (long hair, ponytail mass, back of the head)
   2. **`bodyBack`** – costume pieces behind the body (capes, big bows, wings)
   3. *body skin*: neck, trapezius, shoulders, arms, collarbones, shadow under the chin
   4. **`outfit`** – the clothes (heroine default) or **`outfit.render(p)`** when a costume is composed
   5. **`neckAccessory`** – chokers, collars, pendants
   6. *head*: ears (unless `face.ears === false`), face skin, right-side cel shadow, tapered jaw line
   7. *cast shadow of the bangs*: the `hairFront` silhouette offset by (4, 13), filled `skinShadow`, clipped to the face (automatic)
   8. *face features*: blush, nose, mouth, brows, eyes (driven by `expression` + `palette`);
      the optional **`irisDetail`** hook is drawn inside each iris (after the pupil, under the highlights)
   9. **`faceMarks`** – scars, moles, face paint (drawn on the skin, under the hair)
   10. **`headBack`** – things between face and bangs (headbands, goggles strap, horn bases)
   11. **`hairFront`** – dome of the hair, bangs, side locks (rendered once into `<defs>` and `<use>`d twice)
   12. *brows ghost*: the brows again at `expression.browsOverHair` opacity (anime convention: brows read through bangs)
   13. **`headFront`** – ornaments, horns, mechanical ears, hats
   14. **`outfit.hairOrnament`** – costume hair accessory
   15. **`foreground`** – weapon hilts, drones, staffs, held props
3. *rim light*: whole figure silhouette → `accent` edge on right-facing edges + faint `moon` edge on upper-left edges
4. *lighting*: moon wash from the upper-left, cool ambient from the lower-right, bottom 20% fade to `bgBottom`, vignette

Every layer is a function `(p) => string` returning SVG markup (no wrapper needed). Any layer may
be omitted. Return `''` to draw nothing. Do **not** return non-strings (that counts as an error).

Modules may also `import { ANCHORS, SHAPES, taper, lock, mix, ... } from '../base.mjs'` for use
outside layer functions (read-only – never modify `base.mjs`). `compose(heroine, { outfit, lenient })`
throws if any layer throws, unless `lenient: true` (then the layer is skipped with a warning).

---

## 3. Anchors (`p.anchors`, also `import { ANCHORS }`)

Frozen template coordinates every module may rely on. `L` = viewer's left, `R` = viewer's right
(always symmetric about x = 416).

| Anchor | Value | Meaning |
|---|---|---|
| `cx` | 416 | vertical centre line |
| `headTop` | [416, 172] | top of an average hair volume |
| `skullTop` | [416, 212] | top of the skull (skin outline) |
| `crownL` / `crownR` | [330, 234] / [502, 234] | upper skull corners, where a hair dome turns down |
| `hairlineY` | 300 | natural hairline height at the centre |
| `foreheadY` | 350 | middle of the forehead |
| `templeL` / `templeR` | [268, 390] / [564, 390] | temples, on the face outline |
| `browL` / `browR` | [349, 398] / [483, 398] | brow reference points (drawn brows sit ≈ y403–414, lower with `browAngle`) |
| `eyeY` | 440 | eye line |
| `eyeL` / `eyeR` | [350, 440] / [482, 440] | eye centres; eye width `eyeW` = 70 (corners at x 314–385 / 447–518) |
| `earL` / `earR` | [256, 452] / [576, 452] | ear centres; ears span y 416–494, x 242–276 / 556–590 |
| `cheekL` / `cheekR` | [320, 503] / [512, 503] | cheek / blush centres |
| `noseTip` | [416, 506] | nose tip |
| `mouth` | [416, 559] | mouth centre (default width 38) |
| `jawL` / `jawR` | [333, 566] / [499, 566] | points on the jaw line |
| `chin` | [416, 615] | chin point |
| `neckL` / `neckR` | [374, 600] / [458, 600] | neck sides just under the jaw; `neckW` = 84 |
| `neckBase` | [416, 700] | base of the neck (where the trapezius starts) |
| `sternum` | [416, 720] | jugular notch between the collarbones – anchor necklines here |
| `clavicleL` / `clavicleR` | [296, 734] / [536, 734] | outer ends of the collarbones |
| `shoulderL` / `shoulderR` | [188, 776] / [644, 776] | top of the shoulder caps (on the silhouette) |
| `deltoidL` / `deltoidR` | [150, 850] / [682, 850] | widest point of the shoulders |
| `armpitL` / `armpitR` | [236, 912] / [596, 912] | armpits (sleeve seams meet the torso) |
| `chestCenter` | [416, 860] | centre of the chest (brooches, crystals, emblems) |
| `bustY` / `underBustY` | 900 / 975 | chest line heights (keep garments flat and modest) |
| `waistL` / `waistR` | [286, 1216] / [546, 1216] | torso sides at the bottom edge |
| `armOuterL` / `armOuterR` | [130, 1216] / [702, 1216] | outer arm silhouette at the bottom edge |
| `armInnerL` / `armInnerR` | [232, 1216] / [600, 1216] | inner arm line at the bottom edge |
| `bottomY` | 1216 | canvas bottom |

The full face outline runs (L side) 416,211 → 360,216 → 312,238 → 281,279 → 267,330 → 263,385 →
265,434 → 270,472 → 281,505 → 298,532 → 321,555 → 346,576 → 370,595 → 392,609 → 416,615, mirrored for R.
The body silhouette runs 378,560 → 375,616 → 371,662 → 364,694 → 336,713 → 284,734 → 228,754 →
192,773 → 166,802 → 150,846 → 140,918 → 134,1010 → 130,1216, mirrored for R.

### Shapes (`p.shapes`, also `import { SHAPES }`) – path strings

| Key | Shape |
|---|---|
| `face` | closed face + skull silhouette (what the skin covers) |
| `body` | closed neck + shoulders + arms + torso silhouette down to the bottom edge |
| `neck` | neck column (its top is hidden under the head) |
| `torso` | trunk between the arms – clip vests / bodices / breastplates to it |
| `earL`, `earR` | ear outlines |
| `armSeamL`, `armSeamR` | open paths along the inner arm (armpit) – sleeve seams |

---

## 4. Heroine module

```js
export default {
  id: 'mia',                 // required; file prefix, output name, id prefix
  name: '米娅·铃',           // used for aria-label
  palette: { ... },          // §4.1 – merged over DEFAULT_PALETTE
  expression: { ... },       // §4.2 – merged over DEFAULT_EXPRESSION + eye-shape preset
  face: { ears: true, castShadow: 0.8 }, // optional: hide human ears (e.g. Mia's mechanical ears replace them); bangs cast-shadow opacity
  costumeLayers: ['bodyBack', 'neckAccessory'], // optional: heroine layers that belong to her DEFAULT costume (dropped when an outfit is worn)
  layers: { bgMotif, hairBack, bodyBack, outfit, neckAccessory, faceMarks, headBack, hairFront, headFront, foreground, irisDetail },
};
```

`irisDetail(p)` is called once per eye with `p.eye = { side: 'L' | 'R', cx, cy, rx, ry, eyeTop, eyeBottom, clip }`
(iris centre/radii in canvas px; the markup is already clipped to the eye opening). Use it for
Serena's star-rail rings, Mia's circuit glints, etc. Keep it to 1–3 thin elements – it renders
at ≈ 35 px.

`costumeLayers` default is `['bodyBack', 'neckAccessory']`. Put anything that is *clothing or gear*
(capes, chokers, a weapon in the foreground) there, so costume portraits don't show it; keep
anything that is *her* (hair, horns, mechanical ears, scars) in non-costume layers. Lia uses
`['bodyBack', 'foreground']` (cape and sword disappear in costumes, ponytail and scar stay).

### 4.1 Palette keys (`p.palette`)

| Key | Default | Use |
|---|---|---|
| `accent` | `#ff6b7c` | **character standard colour** – rim light, background glow, trims (art direction table) |
| `accent2` | `#ffd091` | secondary colour – outfit trims, ornaments |
| `hair`, `hairShadow`, `hairDeep`, `hairHighlight`, `hairLine` | purple set | hair base / 1st shadow / deep shadow / highlight / coloured line art (never `#000`) |
| `eyeTop`, `eyeBottom` | `#3a2a55`, `#9f8ad8` | iris gradient: dark top → light bottom |
| `eyeLine` | `#1d1426` | lash line and pupil base |
| `eyeTopR`, `eyeBottomR` | `null` | optional different colours for the viewer's-right eye (heterochromia, e.g. Ophelia) |
| `eyeGlow` | derived | lower iris glow crescent (default: `eyeBottom` lightened) |
| `skin`, `skinShadow`, `skinDeep`, `skinLine`, `skinHighlight` | light warm set | skin base / cel shadow / deep shadow / line / highlight |
| `blush`, `lip`, `mouthLine` | pinks | blush, open-mouth interior, mouth line |
| `brow` | derived from hair | brow colour |
| `lash` | `eyeLine` | lash colour |
| `eyeWhite`, `eyeWhiteShadow` | `#f8f4fc`, `#c9bfe2` | sclera gradient |
| `bgTop`, `bgMid`, `bgBottom` | `#0c0b1b`, `#17132e`, `#070614` | background gradient + bottom fade colour |
| `moon` | `#e8ddff` | moonlight wash / stars / upper-left edge light |
| `gold` | `#ffd091` | oath gold |

Use the standard colours from `docs/ART-DIRECTION.md` §2 for `accent`/`accent2`/hair/eyes.

### 4.2 Expression (`p.expression`)

| Key | Default | Meaning |
|---|---|---|
| `eyeShape` | `'almond'` | preset: `almond` · `sharp` (focused, upturned – Lia) · `round` (bright, open – Mia) · `gentle` (soft, droopy outer corner – Freya) · `narrow` (half-lidded, calm – Serena) |
| `open` | preset | eye opening height multiplier (≈0.85–1.15) |
| `tilt` | preset | outer-corner lift in px (negative = droopy) |
| `lidDrop` | preset | 0..1 lowers/flattens the upper lid (calm, focused, sleepy) |
| `lowerLid` | preset | 0..1 raises the lower lid (squint, smile-eyes) |
| `iris` | preset | iris size multiplier |
| `gaze` | `[0, 0]` | pupil offset, −1..1 per axis (x+ = viewer's right) – use it to give the "3/4" look direction |
| `browAngle` | 0 | + = inner ends lower (stern/determined), − = worried |
| `browRaise` | 0 | + = brows higher (surprise, cheer) |
| `browWeight` | 1 | brow thickness multiplier |
| `browsOverHair` | 0.4 | opacity of the brows re-drawn over the bangs (0 = off) |
| `mouth` | `'neutral'` | `neutral` · `pressed` (lips pressed – Lia) · `smile` (closed) · `grin` (open, teeth) · `open` (small "o") · `smirk` · `soft` (relaxed, slightly parted) · `frown` |
| `mouthWidth` | 1 | mouth width multiplier |
| `blush` | 0.35 | 0..1 blush strength (keep it light) |
| `blushLines` | true | tiny hatch lines on the blush |
| `lashWeight` | 1 | lash line thickness multiplier |
| `lashFlick` | false | one extra lash flick above the wing |
| `pupil` | `'round'` | `'round'` or `'slit'` (draconic / feline pupils) |

---

## 5. The `p` object passed to every layer

| Member | Description |
|---|---|
| `p.heroine` | `{ id, name }` |
| `p.costume` | outfit `type` when a costume portrait is being composed, else `null` (lets a heroine layer adapt) |
| `p.palette`, `p.expression` | merged values (§4.1, §4.2) |
| `p.anchors`, `p.shapes` | §3 |
| `p.id(name)` | unique id for this file. Heroine layers: `lia-name` (portrait) / `lia-maid-name` (costume file). Outfit layers: `lia-maid-o-name`. **Never start your own names with `t-`** (reserved for the template). |
| `p.url(name)` | `url(#<p.id(name)>)` |
| `p.def(markup)` | add markup (gradient, clipPath, pattern…) to the file's `<defs>`; returns `''`. Same id twice = last one wins |
| `p.lin(name, stops, [x1, y1, x2, y2], units?)` | registers a `<linearGradient>`, returns `url(#…)`. `stops` = `[[offset, colour, opacity?], …]`. Coordinates are user space (canvas px) by default; pass `'objectBoundingBox'` for 0..1 coordinates |
| `p.rad(name, stops, { cx, cy, r, fx?, fy? }, units?)` | same for `<radialGradient>` |
| `p.clip(name, d \| d[])` | registers a `<clipPath>` from one path or a list of paths (union), returns `url(#…)` – e.g. clip highlight bands to the union of all bang locks |
| `p.rand()` | deterministic PRNG in [0, 1) (seeded per file) – never use `Math.random` (builds must be reproducible) |
| `p.refs.faceClip` / `bodyClip` / `torsoClip` | `url(#…)` clip paths of the template face, body and torso |
| `p.refs.faceShape` / `bodyShape` | `#…` hrefs of the face/body silhouette paths for `<use href="…" fill="…"/>` |
| `p.refs.soft` | `url(#…)` filter: 6 px gaussian blur (soft shadows, haze) |
| `p.refs.glow` | `url(#…)` filter: bloom (blurred copy under the source) – crystals, embers, magic |
| `p.helpers` | §6 |

**Filters:** the template already uses the art-direction maximum of 4 (`soft`, `glow`, the bangs
cast shadow and the rim light). Modules must **not** add `<filter>` elements – reuse
`p.refs.soft` / `p.refs.glow` (sparingly: they cost render time on low-end phones).

---

## 6. Helpers (`p.helpers`, also named exports of `base.mjs`)

Points are `[x, y]`; a point written `[x, y, 1]` is a **sharp corner** in `smooth`, `smoothQ`.

| Helper | Description |
|---|---|
| `smooth(pts, { closed?, tension? })` | smooth curve **through** every point (Catmull-Rom → cubic, emitted with `S` shorthand). Best for designed silhouettes |
| `smoothQ(pts, { closed? })` | compact quadratic curve where interior points are **control points** (curve passes through their midpoints); first/last/sharp points are exact. ~2× smaller – ideal for generated outlines |
| `taper(pts, { w, start, end, peak, bias, width, samples })` | filled tapered brush stroke along a curve through `pts`. Width profile: `start`/`end` are fractions of `w` at the ends, `peak` is where the max width sits (0..1). `width: t => px` overrides the profile. `bias` −1..1 shifts it off-centre. Use for strands, brows, lashes, creases, scratches |
| `ribbon(pts, (t, i) => [a, b], { samples })` | generic variable-width band: `a`/`b` are signed offsets along the left normal for the two edges. Collapsing to 0 width gives sharp tips |
| `profile({ w, start, end, peak })` | the width function used by `taper` |
| `lock(root, tip, opts)` | one pointed hair lock → `{ d, shade, line, hi, center }`: outline, cel shadow on the side away from the light, strand line, lit-side highlight sliver. `opts`: `w` (width, default 24), `bend` (px sideways, + = left of travel), `curl`, `points` (explicit centre line, overrides bend/curl), `swell` (t of max width), `start` (root width fraction – use ≈0.3 so roots converge at the part instead of showing flat cut ends), `shadeWidth` (0..1 of half-width), `shadeSide: 'left'` (flip), `hi: [t0, t1]` (highlight range) |
| `locks(list, style)` | draws a list of locks (each `{ root, tip, ...lockOpts }`, optional per-lock `fill`, `stroke`, `shadeFill`, `lineFill`, `hiFill`, `noShade`, `noLine`, `noHi`, `hi`) with `style = { fill, shade, line, stroke, highlight, strokeWidth=2.2, lineOpacity=.55, shadeOpacity=1, hiOpacity=.8, hi=false }`. Draw back-to-front: outer/longer locks first, the locks nearest the part last |
| `lockLine(root, tip, bend, curl)` | the centre line `lock` uses (to share it with other shapes) |
| `sampleSpline(pts, count)` | `count` evenly spaced points along the Catmull-Rom curve through `pts` |
| `pathLength(pts)` | polyline length |
| `mirrorPath(d)` | mirror any path string across x = 416 (absolute and relative commands, arcs) – draw the L side once, mirror for R |
| `mirrorPt(p)`, `mirrorPts(pts)` | mirror points (sharp flags kept) |
| `mix(a, b, t)`, `darken(c, t)`, `lighten(c, t)` | `#rrggbb` colour maths |
| `rng(seed)` | standalone seeded PRNG factory (seed number or string) |
| `n(v)`, `pt([x, y])` | number / point formatting (1 decimal) |
| `lerp`, `lerpPt`, `clamp`, `attr` | small maths / XML-escape utilities |

---

## 7. Outfit module

```js
export default {
  type: 'maid',          // required; output suffix  <heroineId>_maid.svg
  label: '女仆装',        // aria-label suffix
  render(p) { ... },     // required: the clothes – replaces heroine.layers.outfit
  hairOrnament(p) {},    // optional: drawn after the heroine's headFront
  bodyBack(p) {},        // optional slots, drawn after (or instead of) the heroine's own layer:
  neckAccessory(p) {},   //   bodyBack, neckAccessory, headBack, headFront, foreground
  headBack(p) {}, headFront(p) {}, foreground(p) {},
  bgMotif(p) {},         // optional: replaces the heroine's background motif (e.g. festival lanterns)
  hide: ['foreground'],  // optional: extra heroine layers to drop while this outfit is worn
};
```

Resolution rules when composing `heroine × outfit`:

- `outfit.render(p)` replaces `heroine.layers.outfit`.
- heroine layers listed in `heroine.costumeLayers` (default `bodyBack`, `neckAccessory`) or in
  `outfit.hide` are dropped; hair, face marks and `headFront` stay unless hidden.
- the outfit's `bodyBack` / `neckAccessory` / `headBack` / `headFront` / `foreground` hooks are
  drawn after the heroine's layer of the same slot (or alone, if hers was dropped).
- `outfit.bgMotif` replaces the heroine's motif when present.
- the heroine's palette is passed to the outfit: use `p.palette.accent` / `accent2` (and `mix`)
  for trims and accents so the outfit **recolours per heroine**; `p.heroine.id` allows small
  per-heroine tweaks.

Drawing an outfit:

- It must **cover the template body** from the neck base (or a collar higher up the neck)
  to the bottom edge – anything not covered shows bare skin. The simplest base is
  `<g clip-path="${p.refs.bodyClip}"><rect y="690" width="832" height="530" fill="…"/></g>`,
  then panels, collars, sleeves seams (`p.shapes.armSeamL/R`), trims on top.
- Necklines start at `p.anchors.sternum` or higher; nothing low-cut, no lingerie/swimwear cuts,
  no emphasis on the chest (`bustY` area stays flat-shaded).
- Long side locks from `hairFront` fall *over* the outfit – keep important details out of
  x ≈ 240–300 and 532–600 between y 600–850 or accept that hair partly covers them.
- Same art rules as heroines: coloured line art (outer 3–3.4 px, inner 1.5–2.4 px), base + one
  shadow + one highlight per material, shade the right/lower side.

---

## 8. Conventions & checklist

- **Light**: moonlight from the upper-left. Shadows on right/lower sides, highlights on upper-left edges.
- **Line art**: same-hue darker lines (`hairLine`, `skinLine`, a darker outfit colour) – never `#000`.
  Outer silhouette 3–3.4 px, inner details 1.5–2.4 px.
- **Cel shading**: per material base + 1 shadow (+ 1 deep shadow sparingly) + 1 highlight; hard edges.
- **Hair**: big confident shapes first (dome, back mass), then locks; highlights as slivers that
  line up into an "angel ring"; darker inner layers (`hairShadow`/`hairDeep`) behind the face.
- **ids**: only via `p.id()` / `p.lin()` / `p.rad()` / `p.clip()`; never hard-code ids.
- **No** `<script>`, `<text>`, `<image>`, `<foreignObject>`, event attributes, external `href`, web fonts, `Math.random`.
- **Size**: the template costs ≈ 19 KB, so a heroine has ≈ 50 KB for her layers (Lia ≈ 50 KB, of
  which her armour/cape/sword ≈ 18 KB are dropped in costumes); an outfit should stay ≤ 25 KB so every
  heroine × outfit fits 80 KB. Prefer `smoothQ`/`taper` for
  generated shapes, `mirrorPath` for symmetric parts, and few long paths over many tiny ones.
- **Review** (mandatory): render, look, fix – full size, 2× face crop, and real UI sizes
  (64 px circular avatar from the centre and the top, 48×58 roster card, 100 px card). The face
  must stay readable at 64 px.

Rendering helpers used during development (any Chromium screenshot works the same):

```
node <arttools>/render.mjs out.png 832 public/assets/portraits/lia.svg        # one file
node <arttools>/render.mjs sheet.png 240 public/assets/portraits/*.svg         # contact sheet
```

---

## 9. Minimal examples

### Heroine – `heroines/example.mjs`

```js
export default {
  id: 'example',
  name: '示例',
  palette: {
    accent: '#5ed7ff', accent2: '#ff9a3c',
    hair: '#3f8fb8', hairShadow: '#2a6688', hairDeep: '#173f5c', hairHighlight: '#9fe6ff', hairLine: '#0f2b40',
    eyeTop: '#0f4656', eyeBottom: '#62e6ff', eyeLine: '#0b1d24',
  },
  expression: { eyeShape: 'round', mouth: 'smile', browRaise: 0.3, blush: 0.45 },
  layers: {
    hairBack(p) {
      const { smooth } = p.helpers;
      const pal = p.palette;
      return `<path d="${smooth([[262, 300], [236, 420], [232, 560], [262, 660], [570, 660], [600, 560], [596, 420], [570, 300], [416, 196]], { closed: true })}" fill="${pal.hairShadow}" stroke="${pal.hairLine}" stroke-width="3.4"/>`;
    },
    outfit(p) {
      const { smooth, mirrorPath } = p.helpers;
      const lapel = smooth([[372, 700], [416, 820, 1], [330, 760], [300, 740]], { closed: true });
      return `<g clip-path="${p.refs.bodyClip}"><rect y="690" width="832" height="530" fill="#2b2f3d"/></g>`
        + `<path d="${lapel}${mirrorPath(lapel)}" fill="#3b4152" stroke="${p.palette.accent}" stroke-width="3"/>`;
    },
    hairFront(p) {
      const { smooth } = p.helpers;
      const pal = p.palette;
      const dome = smooth([[258, 420], [252, 320], [290, 230], [416, 184], [542, 230], [580, 320], [574, 420], [548, 330], [416, 270], [284, 330]], { closed: true });
      const bangs = [
        { root: [404, 214], tip: [356, 404], w: 58, bend: -8 },
        { root: [428, 214], tip: [476, 404], w: 58, bend: 8 },
        { root: [360, 232], tip: [300, 430], w: 52, bend: -10 },
        { root: [472, 232], tip: [532, 430], w: 52, bend: 10 },
        { root: [416, 212], tip: [414, 388], w: 44 },
      ].map((b) => ({ ...b, start: 0.35, swell: 0.4, hi: [0.25, 0.45] }));
      return `<path d="${dome}" fill="${pal.hair}" stroke="${pal.hairLine}" stroke-width="3.4"/>`
        + p.helpers.locks(bangs, { fill: pal.hair, shade: pal.hairShadow, line: pal.hairLine, stroke: pal.hairLine, highlight: pal.hairHighlight, strokeWidth: 2, hi: true });
    },
  },
};
```

### Outfit – `outfits/scarf.mjs`

```js
export default {
  type: 'scarf',
  label: '围巾毛衣',
  render(p) {
    const { smooth, mix } = p.helpers;
    const pal = p.palette;
    const knit = mix(pal.accent, '#2a2238', 0.55);          // recolours per heroine
    const scarf = smooth([[352, 676], [416, 700], [480, 676], [500, 724], [416, 752], [332, 724]], { closed: true });
    return `<g clip-path="${p.refs.bodyClip}"><rect y="680" width="832" height="540" fill="${knit}"/>`
      + `<path d="${p.shapes.armSeamL}${p.shapes.armSeamR}" fill="none" stroke="${mix(knit, '#000000', 0.35)}" stroke-width="3"/></g>`
      + `<path d="${scarf}" fill="${pal.accent2}" stroke="${mix(pal.accent2, '#000000', 0.5)}" stroke-width="3"/>`;
  },
  hairOrnament(p) {
    const a = p.anchors;
    return `<circle cx="${a.crownR[0] + 10}" cy="${a.crownR[1] + 40}" r="10" fill="${p.palette.accent}" stroke="#2a2238" stroke-width="2.5"/>`;
  },
};
```

Both examples are deliberately plain; the reference for real quality is `heroines/lia.mjs`
(gothic-window background, ponytail, side-swept bangs with union-clipped root shadow and per-lock
highlights, layered armour with cel planes and reflection bands, cracked crystal with `p.refs.glow`).

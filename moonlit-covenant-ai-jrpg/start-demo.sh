#!/usr/bin/env sh
# 一键启动零成本演示（Linux / macOS）：强制 AI_MODE=demo，不读模型配置；要接模型请改 .env 后用 npm start。
# 可以从任何目录执行：sh /path/to/start-demo.sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "没有找到 Node.js：请先安装 Node.js 20 或更高版本（https://nodejs.org/），再重新运行。" >&2
  exit 1
fi
export AI_MODE=demo
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-4173}"
exec node server.mjs

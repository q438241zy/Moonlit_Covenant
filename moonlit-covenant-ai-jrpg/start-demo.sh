#!/usr/bin/env sh
set -eu
export AI_MODE=demo
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-4173}"
exec node server.mjs

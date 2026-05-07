#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm install
exec npm run dev -- --host 127.0.0.1 --port 5173

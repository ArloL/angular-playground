#!/bin/sh
set -o errexit
set -o nounset
set -o xtrace

docker run --rm \
  --mount "type=bind,src=$(pwd),dst=/work" \
  --mount "type=volume,dst=/work/node_modules" \
  --workdir /work \
  mcr.microsoft.com/playwright:v1.56.1-noble \
  bash -c "npm ci && npm run e2e:update"

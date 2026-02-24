#!/bin/sh
set -o errexit
set -o nounset
set -o xtrace

# renovate: datasource=docker depName=mcr.microsoft.com/playwright
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v1.56.1-noble"

docker run --rm \
  --mount "type=bind,src=$(pwd),dst=/work" \
  --mount "type=volume,dst=/work/node_modules" \
  --workdir /work \
  "$PLAYWRIGHT_IMAGE" \
  bash -c "npm ci && npm run e2e:update"

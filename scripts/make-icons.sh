#!/bin/bash

set -o errexit
set -o nounset
set -o xtrace

cd "$(dirname "$0")/.." || exit 1

# Input image path
input_image="icon.png"

# Output sizes
sizes=(72 96 128 152 192 384 512)

# Loop over the sizes and resize the image
for size in "${sizes[@]}"; do
  sips \
    --resampleHeightWidthMax "$size" \
    "$input_image" \
    --out "public/icons/icon-${size}x${size}.png"
done

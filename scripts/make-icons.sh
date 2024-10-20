#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o xtrace

cd "$(dirname "$0")/.." || exit 1

# Input image path
input_image="icon.png"

# Output sizes
favicon=(48)
ios=(16 20 29 32 40 48 50 55 57 58 60 64 72 76 80 87 88 100 114 120 128 144 152 167 172 180 196 256 512 1024)
android=(36 48 72 96 144 192 512)
watch=(48 55 80 88 172 196)

sizes=( "${favicon[@]}" "${ios[@]}" "${android[@]}" "${watch[@]}" )

mapfile -t sizes < <(printf "%s\n" "${sizes[@]}" | sort --numeric-sort --unique)

manifest=()
# Loop over the sizes and resize the image
for size in "${sizes[@]}"; do
  magick "$input_image" \
    -resize "${size}x${size}" \
    "public/icons/icon-${size}x${size}.png"
  manifest+=( "{
      \"src\": \"icons/icon-${size}x${size}.png\",
      \"sizes\": \"${size}x${size}\",
      \"type\": \"image/png\",
      \"purpose\": \"maskable any\"
    }," )
done

magick "public/icons/icon-48x48.png" "public/favicon.ico"

html=()
for size in "${ios[@]}"; do
  html+=( "<link rel=\"apple-touch-icon\" sizes=\"${size}x${size}\" href=\"icons/icon-${size}x${size}.png\">" )
done

set +o xtrace

printf "/nPaste this into the manifest\n"
( IFS=$'\n'; echo "${manifest[*]}" )

printf "\nPaste this into the html\n"
( IFS=$'\n'; echo "${html[*]}" )

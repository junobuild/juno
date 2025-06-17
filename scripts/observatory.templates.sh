#!/bin/bash

BASE_URL="https://github.com/junobuild/observatory-templates/releases/download/v0.2.1"
FILES=("deposited-cycles.html" "deposited-cycles.txt" "failed-deposit-cycles.html" "failed-deposit-cycles.txt")
TARGET_DIR="src/observatory/resources"

mkdir -p "$TARGET_DIR"

download_file() {
  local url="$1"
  local target="$2"

  echo "Downloading $(basename "$target")..."
  curl -o "$target" -L "$url"

  if grep -q "Not Found" "$target"; then
    echo "Error: Downloaded file contains 'Not Found'."
    rm -f "$target"
    exit 1
  fi

  if [ $? -eq 0 ]; then
    echo "Download completed successfully: $target"
  else
    echo "Error downloading file. Please check the URL and try again."
    exit 1
  fi
}

for file in "${FILES[@]}"; do
  TARGET_FILE="${TARGET_DIR}/${file}"
  download_file "${BASE_URL}/${file}" "$TARGET_FILE"
done

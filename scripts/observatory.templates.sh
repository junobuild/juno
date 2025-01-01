#!/bin/bash

URL="https://github.com/junobuild/observatory-templates/releases/download/v0.0.2/deposited-cycles.html"
TARGET_DIR="src/observatory/resources"
TARGET_FILE="${TARGET_DIR}/deposited-cycles.html"

mkdir -p "$TARGET_DIR"

echo "Observatory template does not exist. Downloading..."
curl -o "$TARGET_FILE" -L "$URL"

if grep -q "Not Found" "$TARGET_FILE"; then
  echo "Error: Downloaded template contains 'Not Found'."
  rm -f "$TARGET_FILE"
  exit 1
fi

if [ $? -eq 0 ]; then
  echo "Download completed successfully: $TARGET_FILE"
else
  echo "Error downloading template. Please check the URL and try again."
  exit 1
fi

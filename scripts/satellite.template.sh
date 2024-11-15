#!/bin/bash

URL="https://github.com/junobuild/satellite-template/releases/download/v0.0.2/index.html"
TARGET_DIR="src/satellite/resources"
TARGET_FILE="${TARGET_DIR}/index.html"

mkdir -p "$TARGET_DIR"

if [ ! -f "$TARGET_FILE" ]; then
  echo "Satellite template does not exist. Downloading..."
  curl -o "$TARGET_FILE" -L "$URL"

  if [ $? -eq 0 ]; then
    echo "Download completed successfully: $TARGET_FILE"
  else
    echo "Error downloading template. Please check the URL and try again."
    exit 1
  fi
fi

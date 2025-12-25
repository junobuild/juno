#!/bin/bash

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

download_file "https://github.com/dfinity/cycles-ledger/releases/download/cycles-ledger-v1.0.6/cycles-ledger.did" "./cycles.did"


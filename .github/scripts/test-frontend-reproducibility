#!/bin/bash

# A script that runs frontend build in a row and compare the hashes of the generated files.
# Exit if a difference is detected.

DIR=tmp

if [ ! -d "$DIR" ]; then
  mkdir "$DIR"
fi

for ((n = 0; n < 10; n++)); do
  echo "*********** Round $n ***********"

  # We clean the modules because some libraries might generate and reuse a cache saved under node_modules, which could result in different bundles.
  rm -r node_modules
  npm ci

  npm run build && find build -type f -exec sha256sum {} \; | awk '{print $2 " " $1}' | sort >"$DIR/sha256-batch${n}.txt"

  # Save results for manual comparison
  rm -r "$DIR/build-batch${n}" 2>/dev/null
  mv build "$DIR/build-batch${n}"

  if ((n > 0)); then
    previous=$((n - 1))
    file1="sha256-batch${n}.txt"
    file2="sha256-batch${previous}.txt"

    if cmp -s "$DIR/$file1" "$DIR/$file2"; then
      continue
    else
      printf 'The file "%s" is different from "%s".\n' "$file1" "$file2"
      exit 1
    fi
  fi
done

echo 'No difference found.'

#!/usr/bin/env bash

function generate_did_idl() {
  local canister=$1
  local canister_root=$2
  local declaration_path=$3

  if [ ! -d "$declaration_path" ]
  then
       mkdir "$declaration_path"
  fi

  local didfile="$canister_root/$canister.did"

  local generatedFolder="$declaration_path/declarations"
  local generatedTsfile="$canister.did.d.ts"
  local generatedJsfile="$canister.did.js"

  # --actor-disabled: skip generating actor files, since we handle those ourselves
  # --force: overwrite files. Required; otherwise, icp-bindgen would delete files at preprocess,
  # which causes issues when multiple .did files are located in the same folder.
  npx icp-bindgen --did-file "${didfile}" --out-dir "$declaration_path" --actor-disabled --force

  # icp-bindgen generates the files in a `declarations` subfolder
  # using a different suffix for JavaScript as the one we used to use.
  # That's why we have to post-process the results.
  mv "$generatedFolder/$generatedTsfile" "$declaration_path"
  mv "$generatedFolder/$generatedJsfile" "$declaration_path"
  rm -r "$generatedFolder"
}

# Assert @icp-sdk/bindgen is installed

if [[ ! "$(command -v npx)" || "$(npx icp-bindgen --version)" != "0.2.0" ]]
then
    echo "could not find @icp-sdk/binden 0.2.0"
    echo "please run the following command:"
    echo "  npm ci"
    exit 1
fi

# Canisters

CANISTERS=console,observatory,mission_control,orbiter,satellite,sputnik

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did_idl "$canister" "src/$canister" "src/declarations/$canister"
done

# Fixtures

FIXTURES=test_satellite

for fixture in $(echo $FIXTURES | sed "s/,/ /g")
do
    generate_did_idl "$fixture" "src/tests/fixtures/$fixture" "src/tests/declarations/$fixture"
done


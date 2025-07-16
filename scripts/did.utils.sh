function generate_did() {
  local canister=$1
  local canister_root=$2
  local did_filename=$3

  npm run build:"${canister//_/-}"

  if [ -z "$did_filename" ]; then
    candid-extractor "target/wasm/$canister.wasm" > "$canister_root/$canister.did"
  else
    candid-extractor "target/wasm/$canister.wasm" > "$canister_root/$did_filename.did"
  fi
}

function prepend_import_did() {
  local crate=$1
  local canister_root=$2
  local canister=$3
  local canister_extension=$4

  echo -e "import service \"$canister_extension.did\";\n\n$(cat  "$crate")" >  "$canister_root/$canister.did"
}
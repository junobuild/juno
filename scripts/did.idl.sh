function generate_did() {
  local canister=$1
  local canister_root=$2

  if [ ! -d "src/declarations/$canister" ]
  then
       mkdir "src/declarations/$canister"
  fi

  didc bind -t ts "$canister_root"/"$canister".did > src/declarations/"$canister"/"$canister".did.d.ts
  didc bind -t js "$canister_root"/"$canister".did > src/declarations/"$canister"/"$canister".did.js
}

CANISTERS=console,observatory,mission_control,orbiter,satellite

for canister in $(echo $CANISTERS | sed "s/,/ /g")
do
    generate_did "$canister" "src/$canister"
done

generate_did "cmc" "candid"
generate_did "ic" "candid"
generate_did "index" "."
generate_did "ledger" "."
generate_did "internet_identity" "."

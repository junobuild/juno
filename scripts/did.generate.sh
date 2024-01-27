function generate_did() {
  local canister=$1

  canister_root="src/$canister"

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

dfx generate cmc
dfx generate index
dfx generate internet_identity
dfx generate ledger
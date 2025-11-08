#!/usr/bin/env bash

# ic-management to declarations
cp node_modules/@dfinity/ic-management/dist/candid/ic-management.d.ts src/declarations/ic-management/ic-management.did.d.ts >/dev/null
cp node_modules/@dfinity/ic-management/dist/candid/ic-management.certified.idl.js src/declarations/ic-management/ic-management.factory.certified.did.js >/dev/null
cp node_modules/@dfinity/ic-management/dist/candid/ic-management.idl.js src/declarations/ic-management/ic-management.factory.did.js >/dev/null

cp node_modules/@dfinity/ledger-icp/dist/candid/ledger.d.ts src/declarations/ledger/icp/ledger.did.d.ts >/dev/null
cp node_modules/@dfinity/ledger-icp/dist/candid/ledger.certified.idl.js src/declarations/ledger/icp/ledger.factory.certified.did.js >/dev/null
cp node_modules/@dfinity/ledger-icp/dist/candid/ledger.idl.js src/declarations/ledger/icp/ledger.factory.did.js >/dev/null

echo "@dfinity did files copied"

# mjs
cp src/declarations/console/console.factory.did.js src/declarations/console/console.factory.did.mjs >/dev/null
cp src/declarations/satellite/satellite.factory.did.js src/declarations/satellite/satellite.factory.did.mjs >/dev/null
cp src/declarations/observatory/observatory.factory.did.js src/declarations/observatory/observatory.factory.did.mjs >/dev/null
cp src/declarations/satellite/satellite.factory.did.js src/declarations/satellite/satellite.factory.did.mjs >/dev/null
cp src/declarations/orbiter/orbiter.factory.did.js src/declarations/orbiter/orbiter.factory.did.mjs >/dev/null
cp src/declarations/ic-management/ic-management.factory.did.js src/declarations/ic-management/ic-management.factory.did.mjs >/dev/null

echo "Factory .mjs files copied"
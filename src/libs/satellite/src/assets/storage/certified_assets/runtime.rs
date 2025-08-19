use crate::assets::storage::strategy_impls::{StorageCertificate, StorageState};
use crate::memory::internal::STATE;
use crate::types::state::State;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;

pub fn init_certified_assets() {
    STATE.with(|state| init_certified_assets_impl(&state.borrow()));
}

fn init_certified_assets_impl(state: &State) {
    let mut asset_hashes = CertifiedAssetHashes::default();

    let config = &state.heap.storage.config;

    for (_key, asset) in state.heap.storage.assets.iter() {
        asset_hashes.insert(asset, config);
    }

    for entry in state.stable.assets.iter() {
        asset_hashes.insert(&entry.value(), config);
    }

    extend_and_init_certified_assets(&mut asset_hashes, config, &StorageState, &StorageCertificate)
}

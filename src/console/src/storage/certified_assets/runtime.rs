use crate::memory::STATE;
use crate::storage::strategy_impls::StorageState;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;
use junobuild_storage::types::state::StorageHeapState;

pub fn init_certified_assets() {
    STATE.with(|state| init_certified_assets_impl(&state.borrow().heap.storage));
}

fn init_certified_assets_impl(storage: &StorageHeapState) {
    let mut asset_hashes = CertifiedAssetHashes::default();

    let config = &storage.config;

    for (_key, asset) in storage.assets.iter() {
        asset_hashes.insert(asset, config);
    }

    extend_and_init_certified_assets(&mut asset_hashes, config, &StorageState)
}

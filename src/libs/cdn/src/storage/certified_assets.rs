use crate::strategies::CdnHeapStrategy;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;
use junobuild_storage::strategies::StorageStateStrategy;

pub fn init_certified_assets(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
) {
    let mut asset_hashes = CertifiedAssetHashes::default();

    let config = cdn_heap.get_config();

    for (_key, asset) in cdn_heap.get_assets().iter() {
        asset_hashes.insert(asset, config);
    }

    extend_and_init_certified_assets(&mut asset_hashes, config, storage_state)
}

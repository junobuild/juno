use crate::strategies::CdnHeapStrategy;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;
use junobuild_storage::strategies::{StorageCertificateStrategy, StorageStateStrategy};

pub fn init_certified_assets(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) {
    let mut asset_hashes = CertifiedAssetHashes::default();

    cdn_heap.with_config(|config| {
        cdn_heap.with_assets(|assets| {
            for (_key, asset) in assets.iter() {
                asset_hashes.insert(asset, config);
            }

            extend_and_init_certified_assets(&mut asset_hashes, config, storage_state, certificate);
        });
    });
}

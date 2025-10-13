use crate::cdn::strategies_impls::storage::StorageState;
use crate::certification::strategy_impls::StorageCertificate;
use crate::store::{with_assets, with_config};
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::certified_assets::extend_and_init_certified_assets;

pub fn init_certified_assets() {
    let mut asset_hashes = CertifiedAssetHashes::default();

    with_config(|config| {
        with_assets(|assets| {
            for (_key, asset) in assets.iter() {
                asset_hashes.insert(asset, config);
            }

            extend_and_init_certified_assets(
                &mut asset_hashes,
                config,
                &StorageState,
                &StorageCertificate,
            );
        });
    });
}

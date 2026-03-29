use crate::certification::types::certified::CertifiedAssetHashes;
use crate::memory::STATE;
use crate::rewrites::rewrite_source_to_path;
use crate::routing::get_routing;
use crate::runtime::init_certified_assets;
use crate::strategies::{StorageCertificateStrategy, StorageStateStrategy};
use crate::types::config::StorageConfig;
use crate::types::http_request::{Routing, RoutingDefault};
use crate::types::interface::{CertifyAssetsCursor, CertifyAssetsStrategy};

pub fn extend_and_init_certified_assets(
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
) {
    // 1. Extend with rewrite etc.
    extend_certified_assets(asset_hashes, config, storage_state);

    // 2. Save the asset tree in the runtime heap
    init_certified_assets(asset_hashes);

    // 3. Update the root hash and the canister certified data
    certificate.update_certified_data();
}

pub fn certify_assets_chunk<F>(
    strategy: CertifyAssetsStrategy,
    config: &StorageConfig,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
    insert: F,
) -> Option<CertifyAssetsCursor>
where
    F: FnOnce(&mut CertifiedAssetHashes) -> Option<CertifyAssetsCursor>,
{
    // 1. Borrow or re-create the asset tree
    let next_cursor = STATE.with(|state| {
        let asset_hashes = &mut state.borrow_mut().runtime.storage.asset_hashes;

        if let CertifyAssetsStrategy::Clear = strategy {
            *asset_hashes = CertifiedAssetHashes::default();
        }

        let next_cursor = insert(asset_hashes);

        // 2. Extend with rewrite etc.
        if next_cursor.is_none() {
            if let CertifyAssetsStrategy::AppendWithRouting = strategy {
                extend_certified_assets(asset_hashes, config, storage_state);
            }
        }

        next_cursor
    });

    // 3. Update the root hash and the canister certified data
    certificate.update_certified_data();

    next_cursor
}

fn extend_certified_assets(
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    storage_state: &impl StorageStateStrategy,
) {
    for (source, destination) in config.rewrites.clone() {
        if let Ok(Routing::Default(RoutingDefault { url: _, asset })) =
            get_routing(destination, &Vec::new(), false, storage_state)
        {
            let src_path = rewrite_source_to_path(&source);

            if let Some((asset, _)) = asset {
                asset_hashes.insert_rewrite_v2(&src_path, &asset, config);
            }
        }
    }

    for (source, redirect) in config.unwrap_redirects() {
        asset_hashes.insert_redirect_v2(
            &source,
            redirect.status_code,
            &redirect.location,
            &config.unwrap_iframe(),
        );
    }
}

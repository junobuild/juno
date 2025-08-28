use crate::certification::types::certified::CertifiedAssetHashes;
use crate::rewrites::rewrite_source_to_path;
use crate::routing::get_routing;
use crate::runtime::init_certified_assets;
use crate::strategies::{StorageCertificateStrategy, StorageStateStrategy};
use crate::types::config::StorageConfig;
use crate::types::http_request::{Routing, RoutingDefault};

pub fn extend_and_init_certified_assets(
    asset_hashes: &mut CertifiedAssetHashes,
    config: &StorageConfig,
    storage_state: &impl StorageStateStrategy,
    certificate: &impl StorageCertificateStrategy,
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

    init_certified_assets(asset_hashes, certificate);
}

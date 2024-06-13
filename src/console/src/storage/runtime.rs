use crate::memory::STATE;
use crate::storage::strategy_impls::StorageState;
use crate::types::state::State;
use junobuild_storage::certification::types::certified::CertifiedAssetHashes;
use junobuild_storage::rewrites::rewrite_source_to_path;
use junobuild_storage::routing::get_routing;
use junobuild_storage::runtime::init_certified_assets as init_certified_assets_storage;
use junobuild_storage::types::http_request::{Routing, RoutingDefault};

/// Certified assets

pub fn init_certified_assets() {
    fn init_asset_hashes(state: &State) -> CertifiedAssetHashes {
        let mut asset_hashes = CertifiedAssetHashes::default();

        let config = &state.heap.get_storage().config;

        for (_key, asset) in state.heap.get_storage().assets.iter() {
            asset_hashes.insert(asset, config);
        }

        for (source, destination) in state.heap.get_storage().config.rewrites.clone() {
            if let Ok(Routing::Default(RoutingDefault { url: _, asset })) =
                get_routing(destination, &Vec::new(), false, &StorageState)
            {
                let src_path = rewrite_source_to_path(&source);

                if let Some((asset, _)) = asset {
                    asset_hashes.insert_rewrite_v2(&src_path, &asset, config);
                }
            }
        }

        for (source, redirect) in state.heap.get_storage().config.unwrap_redirects() {
            asset_hashes.insert_redirect_v2(
                &source,
                redirect.status_code,
                &redirect.location,
                &config.unwrap_iframe(),
            );
        }

        asset_hashes
    }

    let asset_hashes = STATE.with(|state| init_asset_hashes(&state.borrow()));

    init_certified_assets_storage(&asset_hashes);
}

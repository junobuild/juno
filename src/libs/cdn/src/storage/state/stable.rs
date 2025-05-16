use crate::storage::types::state::{AssetKey, AssetsStable};
use crate::strategies::CdnStableStrategy;
use crate::types::state::ProposalId;
use junobuild_collections::types::core::CollectionKey;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;

pub fn get_asset(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    cdn_stable
        .with_assets(|assets| get_asset_stable_impl(proposal_id, collection, full_path, assets))
}

fn get_asset_stable_impl(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &AssetsStable,
) -> Option<Asset> {
    assets.get(&stable_asset_key(proposal_id, collection, full_path))
}

fn stable_asset_key(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> AssetKey {
    AssetKey {
        proposal_id: *proposal_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

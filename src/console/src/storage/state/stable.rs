use crate::strategies_impls::cdn::CdnStable;
use junobuild_cdn::proposals::ProposalId;
use junobuild_collections::types::core::CollectionKey;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};

pub fn get_asset_stable(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    junobuild_cdn::storage::stable::get_asset(&CdnStable, proposal_id, collection, full_path)
}

pub fn insert_asset_encoding_stable(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    junobuild_cdn::storage::stable::insert_asset_encoding(
        &CdnStable,
        full_path,
        encoding_type,
        encoding,
        asset,
    )
}

pub fn insert_asset_stable(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    junobuild_cdn::storage::stable::insert_asset(
        &CdnStable,
        proposal_id,
        collection,
        full_path,
        asset,
    )
}

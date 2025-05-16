use crate::strategies_impls::cdn::CdnStable;
use crate::types::state::ProposalId;
use junobuild_cdn::ProposalAssetKey;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::core::Blob;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, BlobOrKey};

pub fn get_asset_stable(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    junobuild_cdn::stable::get_asset(&CdnStable, proposal_id, collection, full_path)
}

pub fn get_content_chunks_stable(encoding: &AssetEncoding, chunk_index: usize) -> Option<Blob> {
    junobuild_cdn::stable::get_content_chunks(&CdnStable, encoding, chunk_index)
}

pub fn get_assets_stable(proposal_id: &ProposalId) -> Vec<(ProposalAssetKey, Asset)> {
    junobuild_cdn::stable::get_assets(&CdnStable, proposal_id)
}

pub fn insert_asset_encoding_stable(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    junobuild_cdn::stable::insert_asset_encoding(
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
    junobuild_cdn::stable::insert_asset(&CdnStable, proposal_id, collection, full_path, asset)
}

pub fn delete_asset_stable(key: &ProposalAssetKey) -> Option<Asset> {
    junobuild_cdn::stable::delete_asset(&CdnStable, key)
}

pub fn delete_content_chunks_stable(content_chunks_keys: &[BlobOrKey]) {
    junobuild_cdn::stable::delete_content_chunks(&CdnStable, content_chunks_keys)
}

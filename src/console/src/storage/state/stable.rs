use crate::memory::STATE;
use crate::storage::strategy_impls::CdnStable;
use crate::types::state::ProposalId;
use junobuild_cdn::{AssetKey, AssetsStable, ContentChunkKey, ContentChunksStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::types::core::Blob;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, BlobOrKey};
use std::borrow::Cow;

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

pub fn get_assets_stable(proposal_id: &ProposalId) -> Vec<(AssetKey, Asset)> {
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
    STATE.with(|state| {
        insert_asset_stable_impl(
            proposal_id,
            collection,
            full_path,
            asset,
            &mut state.borrow_mut().stable.proposals_assets,
        )
    })
}

fn insert_asset_stable_impl(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut AssetsStable,
) {
    assets.insert(
        stable_asset_key(proposal_id, collection, full_path),
        asset.clone(),
    );
}

pub fn delete_asset_stable(key: &AssetKey) -> Option<Asset> {
    STATE.with(|state| {
        delete_asset_stable_impl(key, &mut state.borrow_mut().stable.proposals_assets)
    })
}

fn delete_asset_stable_impl(key: &AssetKey, assets: &mut AssetsStable) -> Option<Asset> {
    assets.remove(key)
}

pub fn delete_content_chunks_stable(content_chunks_keys: &[BlobOrKey]) {
    STATE.with(|state| {
        delete_content_chunks_stable_impl(
            content_chunks_keys,
            &mut state.borrow_mut().stable.proposals_content_chunks,
        )
    })
}

fn delete_content_chunks_stable_impl(
    content_chunks_keys: &[BlobOrKey],
    content_chunks: &mut ContentChunksStable,
) {
    for chunk in content_chunks_keys.iter() {
        let key: ContentChunkKey = deserialize_from_bytes(Cow::Owned(chunk.clone()));
        content_chunks.remove(&key);
    }
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

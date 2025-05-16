use crate::memory::STATE;
use crate::storage::strategy_impls::CdnStable;
use crate::types::state::ProposalId;
use junobuild_cdn::{AssetKey, AssetsStable, ContentChunkKey, ContentChunksStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::types::core::Blob;
use junobuild_storage::stable_utils::insert_asset_encoding_stable as insert_asset_encoding_stable_utils;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding, BlobOrKey};
use std::borrow::Cow;
use std::ops::RangeBounds;

pub fn get_asset_stable(
    proposal_id: &ProposalId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    junobuild_cdn::stable::get_asset(&CdnStable, proposal_id, collection, full_path)
}

pub fn get_content_chunks_stable(encoding: &AssetEncoding, chunk_index: usize) -> Option<Blob> {
    STATE.with(|state| {
        get_content_chunks_stable_impl(
            encoding,
            chunk_index,
            &state.borrow().stable.proposals_content_chunks,
        )
    })
}

fn get_content_chunks_stable_impl(
    encoding: &AssetEncoding,
    chunk_index: usize,
    content_chunks: &ContentChunksStable,
) -> Option<Blob> {
    let key: ContentChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

pub fn get_assets_stable(proposal_id: &ProposalId) -> Vec<(AssetKey, Asset)> {
    STATE.with(|state| get_assets_stable_impl(proposal_id, &state.borrow().stable.proposals_assets))
}

fn get_assets_stable_impl(
    proposal_id: &ProposalId,
    proposal_assets: &AssetsStable,
) -> Vec<(AssetKey, Asset)> {
    proposal_assets
        .range(filter_assets_range(proposal_id))
        .collect()
}

fn filter_assets_range(proposal_id: &ProposalId) -> impl RangeBounds<AssetKey> {
    let start_key = AssetKey {
        proposal_id: *proposal_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    let end_key = AssetKey {
        proposal_id: *proposal_id + 1,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

pub fn insert_asset_encoding_stable(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    STATE.with(|state| {
        insert_asset_encoding_stable_utils(
            full_path,
            encoding_type,
            encoding,
            asset,
            stable_encoding_chunk_key,
            &mut state.borrow_mut().stable.proposals_content_chunks,
        )
    })
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

fn stable_encoding_chunk_key(
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> ContentChunkKey {
    ContentChunkKey {
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

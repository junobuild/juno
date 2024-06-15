use crate::storage::types::state::{AssetKey, AssetsStable, ContentChunkKey, ContentChunksStable};
use crate::STATE;
use junobuild_shared::serializers::deserialize_from_bytes;
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::stable_utils::insert_asset_encoding_stable as insert_asset_encoding_stable_utils;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use std::borrow::Cow;
use std::ops::RangeBounds;

pub fn get_asset_stable(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    STATE.with(|state| {
        get_asset_stable_impl(
            batch_group_id,
            collection,
            full_path,
            &state.borrow().stable.proposals_assets,
        )
    })
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

pub fn get_assets_stable(batch_group_id: &BatchGroupId) -> Vec<(AssetKey, Asset)> {
    STATE.with(|state| {
        get_assets_stable_impl(batch_group_id, &state.borrow().stable.proposals_assets)
    })
}

fn get_assets_stable_impl(
    batch_group_id: &BatchGroupId,
    proposal_assets: &AssetsStable,
) -> Vec<(AssetKey, Asset)> {
    proposal_assets
        .range(filter_assets_range(batch_group_id))
        .collect()
}

fn filter_assets_range(batch_group_id: &BatchGroupId) -> impl RangeBounds<AssetKey> {
    let start_key = AssetKey {
        batch_group_id: *batch_group_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    let end_key = AssetKey {
        batch_group_id: *batch_group_id + 1,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

fn get_asset_stable_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &AssetsStable,
) -> Option<Asset> {
    assets.get(&stable_asset_key(batch_group_id, collection, full_path))
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
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    STATE.with(|state| {
        insert_asset_stable_impl(
            batch_group_id,
            collection,
            full_path,
            asset,
            &mut state.borrow_mut().stable.proposals_assets,
        )
    })
}

fn insert_asset_stable_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut AssetsStable,
) {
    assets.insert(
        stable_asset_key(batch_group_id, collection, full_path),
        asset.clone(),
    );
}

fn stable_asset_key(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> AssetKey {
    AssetKey {
        batch_group_id: *batch_group_id,
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

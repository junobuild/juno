use std::borrow::Cow;
use crate::storage::types::state::{BatchGroupAssetsStable, BatchGroupContentChunksStable, BatchGroupStableEncodingChunkKey, BatchGroupStableKey};
use crate::STATE;
use junobuild_shared::list::range_collection_end;
use junobuild_shared::types::core::{Blob, CollectionKey};
use junobuild_storage::stable_utils::insert_asset_encoding_stable;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};
use std::ops::RangeBounds;
use junobuild_shared::serializers::deserialize_from_bytes;

pub fn get_batch_group_asset(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> Option<Asset> {
    STATE.with(|state| {
        get_batch_group_asset_impl(
            batch_group_id,
            collection,
            full_path,
            &state.borrow().stable.batch_assets,
        )
    })
}

pub fn get_batch_group_content_chunks(
    encoding: &AssetEncoding,
    chunk_index: usize,
) -> Option<Blob> {
    STATE.with(|state| {
        get_batch_group_content_chunks_impl(
            encoding,
            chunk_index,
            &state.borrow().stable.batch_content_chunks,
        )
    })
}

fn get_batch_group_content_chunks_impl(
    encoding: &AssetEncoding,
    chunk_index: usize,
    content_chunks: &BatchGroupContentChunksStable,
) -> Option<Blob> {
    let key: BatchGroupStableEncodingChunkKey =
        deserialize_from_bytes(Cow::Owned(encoding.content_chunks[chunk_index].clone()));
    content_chunks.get(&key)
}

pub fn get_batch_groups_assets(batch_group_id: &BatchGroupId) -> Vec<(BatchGroupStableKey, Asset)> {
    STATE.with(|state| {
        get_batch_groups_assets_impl(batch_group_id, &state.borrow().stable.batch_assets)
    })
}

fn get_batch_groups_assets_impl(
    batch_group_id: &BatchGroupId,
    batch_assets: &BatchGroupAssetsStable,
) -> Vec<(BatchGroupStableKey, Asset)> {
    batch_assets
        .range(filter_assets_range(batch_group_id))
        .collect()
}

fn filter_assets_range(batch_group_id: &BatchGroupId) -> impl RangeBounds<BatchGroupStableKey> {
    let start_key = BatchGroupStableKey {
        batch_group_id: *batch_group_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    let end_key = BatchGroupStableKey {
        batch_group_id: *batch_group_id,
        collection: "".to_string(),
        full_path: "".to_string(),
    };

    start_key..end_key
}

fn get_batch_group_asset_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    assets: &BatchGroupAssetsStable,
) -> Option<Asset> {
    assets.get(&stable_batch_group_key(
        batch_group_id,
        collection,
        full_path,
    ))
}

pub fn insert_batch_group_asset_encoding(
    full_path: &FullPath,
    encoding_type: &str,
    encoding: &AssetEncoding,
    asset: &mut Asset,
) {
    STATE.with(|state| {
        insert_asset_encoding_stable(
            full_path,
            encoding_type,
            encoding,
            asset,
            stable_batch_group_encoding_chunk_key,
            &mut state.borrow_mut().stable.batch_content_chunks,
        )
    })
}

pub fn insert_batch_group_asset(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
) {
    STATE.with(|state| {
        insert_batch_group_asset_impl(
            batch_group_id,
            collection,
            full_path,
            asset,
            &mut state.borrow_mut().stable.batch_assets,
        )
    })
}

fn insert_batch_group_asset_impl(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
    asset: &Asset,
    assets: &mut BatchGroupAssetsStable,
) {
    assets.insert(
        stable_batch_group_key(batch_group_id, collection, full_path),
        asset.clone(),
    );
}

fn stable_batch_group_key(
    batch_group_id: &BatchGroupId,
    collection: &CollectionKey,
    full_path: &FullPath,
) -> BatchGroupStableKey {
    BatchGroupStableKey {
        batch_group_id: *batch_group_id,
        collection: collection.clone(),
        full_path: full_path.clone(),
    }
}

fn stable_batch_group_encoding_chunk_key(
    full_path: &FullPath,
    encoding_type: &str,
    chunk_index: usize,
) -> BatchGroupStableEncodingChunkKey {
    BatchGroupStableEncodingChunkKey {
        full_path: full_path.clone(),
        encoding_type: encoding_type.to_owned(),
        chunk_index,
    }
}

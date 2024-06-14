use crate::storage::types::state::{
    BatchGroupAssetsStable, BatchGroupStableEncodingChunkKey, BatchGroupStableKey,
};
use crate::STATE;
use junobuild_shared::types::core::CollectionKey;
use junobuild_storage::stable_utils::insert_asset_encoding_stable;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, AssetEncoding};

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

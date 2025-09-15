use crate::assets::storage::store::{commit_batch_store, create_batch_store, create_chunk_store};
use crate::hooks::storage::{
    invoke_on_delete_asset, invoke_on_delete_filtered_assets, invoke_on_delete_many_assets,
    invoke_upload_asset,
};
use crate::{
    caller, count_assets_store, count_collection_assets_store, delete_asset_store,
    delete_assets_store, delete_filtered_assets_store, get_asset_store, list_assets_store,
};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_storage::types::interface::{
    AssetNoContent, CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;

pub fn init_asset_upload(init: InitAssetKey) -> InitUploadResult {
    let caller = caller();

    let batch_id = create_batch_store(caller, init).unwrap_or_trap();

    InitUploadResult { batch_id }
}

pub fn upload_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();

    let chunk_id = create_chunk_store(caller, chunk).unwrap_or_trap();

    UploadChunkResult { chunk_id }
}

pub fn commit_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let asset = commit_batch_store(caller, commit).unwrap_or_trap();

    invoke_upload_asset(&caller, &asset);
}

pub fn list_assets(collection: CollectionKey, filter: ListParams) -> ListResults<AssetNoContent> {
    let caller = caller();

    list_assets_store(caller, &collection, &filter).unwrap_or_trap()
}

pub fn count_assets(collection: CollectionKey, filter: ListParams) -> usize {
    let caller = caller();

    count_assets_store(caller, &collection, &filter).unwrap_or_trap()
}

pub fn del_asset(collection: CollectionKey, full_path: FullPath) {
    let caller = caller();

    let asset = delete_asset_store(caller, &collection, full_path).unwrap_or_trap();

    invoke_on_delete_asset(&caller, &asset)
}

pub fn del_many_assets(assets: Vec<(CollectionKey, String)>) {
    let caller = caller();

    let mut results: Vec<Option<Asset>> = Vec::new();

    for (collection, full_path) in assets {
        let deleted_asset = delete_asset_store(caller, &collection, full_path).unwrap_or_trap();
        results.push(deleted_asset);
    }

    invoke_on_delete_many_assets(&caller, &results);
}

pub fn del_filtered_assets(collection: CollectionKey, filter: ListParams) {
    let caller = caller();

    let results = delete_filtered_assets_store(caller, collection, &filter).unwrap_or_trap();

    invoke_on_delete_filtered_assets(&caller, &results);
}

pub fn del_assets(collection: CollectionKey) {
    delete_assets_store(&collection).unwrap_or_trap();
}

pub fn count_collection_assets(collection: CollectionKey) -> usize {
    count_collection_assets_store(&collection).unwrap_or_trap()
}

pub fn get_asset(collection: CollectionKey, full_path: FullPath) -> Option<AssetNoContent> {
    let caller = caller();

    let asset = get_asset_store(caller, &collection, full_path).unwrap_or_trap();

    asset.map(|asset| AssetNoContent::from(&asset))
}

pub fn get_many_assets(
    assets: Vec<(CollectionKey, FullPath)>,
) -> Vec<(FullPath, Option<AssetNoContent>)> {
    assets
        .iter()
        .map(|(collection, full_path)| {
            let asset = get_asset(collection.clone(), full_path.clone());
            (full_path.clone(), asset.clone())
        })
        .collect()
}

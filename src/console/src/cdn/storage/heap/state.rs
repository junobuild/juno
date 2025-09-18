use crate::memory::services::{with_assets, with_assets_mut};
use junobuild_collections::types::core::CollectionKey;
use junobuild_storage::heap_utils::collect_delete_assets_heap;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::Asset;

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    with_assets(|assets| get_asset_impl(full_path, assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset) {
    with_assets_mut(|assets| insert_asset_impl(full_path, asset, assets))
}

fn insert_asset_impl(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

pub fn delete_asset(full_path: &FullPath) -> Option<Asset> {
    with_assets_mut(|assets| delete_asset_impl(full_path, assets))
}

fn delete_asset_impl(full_path: &FullPath, assets: &mut AssetsHeap) -> Option<Asset> {
    assets.remove(full_path)
}

pub fn collect_delete_assets(collection: &CollectionKey) -> Vec<FullPath> {
    with_assets(|assets| collect_delete_assets_heap(collection, assets))
}

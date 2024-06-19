use crate::types::state::{AssetsHeap, FullPath};
use crate::types::store::Asset;
use crate::utils::should_include_asset_for_deletion;
use junobuild_shared::types::core::CollectionKey;

pub fn collect_assets_heap<'a>(
    collection: &CollectionKey,
    assets: &'a AssetsHeap,
) -> Vec<(&'a FullPath, &'a Asset)> {
    assets
        .iter()
        .filter_map(|(_, asset)| filter_assets_heap(asset, collection))
        .collect()
}

pub fn collect_delete_assets_heap(
    collection: &CollectionKey,
    assets: &AssetsHeap,
) -> Vec<FullPath> {
    collect_assets_heap(collection, assets)
        .iter()
        .filter(|(_, asset)| should_include_asset_for_deletion(collection, &asset.key.full_path))
        .map(|(_, asset)| asset.key.full_path.clone())
        .collect()
}

pub fn count_assets_heap(collection: &CollectionKey, assets: &AssetsHeap) -> usize {
    assets
        .iter()
        .filter_map(|(_, asset)| filter_assets_heap(asset, collection))
        .count()
}

fn filter_assets_heap<'a>(
    asset: &'a Asset,
    collection: &CollectionKey,
) -> Option<(&'a FullPath, &'a Asset)> {
    if &asset.key.collection == collection {
        Some((&asset.key.full_path, asset))
    } else {
        None
    }
}

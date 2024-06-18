use crate::types::state::{AssetsHeap, FullPath};
use crate::types::store::Asset;
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

use crate::strategies::CdnHeapStrategy;
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::heap_utils::collect_delete_assets_heap;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::Asset;

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath) -> Option<Asset> {
    cdn_heap.with_assets(|assets| get_asset_impl(full_path, assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

pub fn insert_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath, asset: &Asset) {
    cdn_heap.with_assets_mut(|assets| insert_asset_impl(full_path, asset, assets))
}

fn insert_asset_impl(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

pub fn delete_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath) -> Option<Asset> {
    cdn_heap.with_assets_mut(|assets| delete_asset_impl(full_path, assets))
}

fn delete_asset_impl(full_path: &FullPath, assets: &mut AssetsHeap) -> Option<Asset> {
    assets.remove(full_path)
}

pub fn collect_delete_assets(
    cdn_heap: &impl CdnHeapStrategy,
    collection: &CollectionKey,
) -> Vec<FullPath> {
    cdn_heap.with_assets(|assets| collect_delete_assets_heap(collection, assets))
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(
    cdn_heap: &impl CdnHeapStrategy,
    collection: &CollectionKey,
) -> Result<Rule, String> {
    let rule = cdn_heap.with_rules(|rules| {
        let rule = rules.get(collection);
        rule.cloned()
    });

    match rule {
        None => Err(msg_storage_collection_not_found(collection)),
        Some(rule) => Ok(rule),
    }
}

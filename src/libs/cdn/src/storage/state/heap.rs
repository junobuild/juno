use crate::strategies::CdnHeapStrategy;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::Asset;

pub fn get_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath) -> Option<Asset> {
    cdn_heap.with_assets(|assets| get_asset_impl(full_path, assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

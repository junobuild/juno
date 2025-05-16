use junobuild_collections::types::rules::Rules;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub trait CdnHeapStrategy {
    fn with_config<R>(&self, f: impl FnOnce(&StorageConfig) -> R) -> R;

    fn with_assets<R>(&self, f: impl FnOnce(&AssetsHeap) -> R) -> R;
    fn with_assets_mut<R>(&self, f: impl FnOnce(&mut AssetsHeap) -> R) -> R;

    fn with_rules<R>(&self, f: impl FnOnce(&Rules) -> R) -> R;
}

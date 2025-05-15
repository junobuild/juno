use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::AssetsHeap;

pub trait CdnHeapStrategy {
    fn get_config(&self) -> &StorageConfig;

    fn get_assets(&self) -> &AssetsHeap;
}

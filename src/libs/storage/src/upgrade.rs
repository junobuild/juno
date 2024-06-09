use crate::interfaces::ContentStore;
use crate::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::types::state::{AssetsStable, StorageHeapState};

pub async fn init_certified_assets(
    heap: &StorageHeapState,
    stable_assets: &AssetsStable,
    content_store: &impl ContentStore,
) {
    init_runtime_certified_assets(heap, stable_assets, content_store);
}

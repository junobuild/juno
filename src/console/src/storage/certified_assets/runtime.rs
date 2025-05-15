use crate::storage::strategy_impls::{CdnHeap, StorageState};
use junobuild_cdn::init_certified_assets as init_runtime_certified_assets;

pub fn init_certified_assets() {
    init_runtime_certified_assets(&CdnHeap, &StorageState);
}

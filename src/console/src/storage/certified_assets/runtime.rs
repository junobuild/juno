use crate::storage::strategy_impls::{CdnHeap, StorageState};

pub fn init_certified_assets() {
    junobuild_cdn::init_certified_assets(&CdnHeap, &StorageState);
}

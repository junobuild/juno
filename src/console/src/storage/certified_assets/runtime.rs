use crate::storage::strategy_impls::{CdnHeap, StorageState};
use junobuild_cdn::init_certified_assets as cdn_init_certified_assets;

pub fn init_certified_assets() {
    cdn_init_certified_assets(&CdnHeap, &StorageState);
}

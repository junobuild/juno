use crate::strategies_impls::cdn::CdnHeap;
use crate::strategies_impls::storage::StorageState;

pub fn init_certified_assets() {
    junobuild_cdn::storage::init_certified_assets(&CdnHeap, &StorageState);
}

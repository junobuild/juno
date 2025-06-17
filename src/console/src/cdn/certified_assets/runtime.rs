use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::StorageState;

pub fn init_certified_assets() {
    junobuild_cdn::storage::init_certified_assets(&CdnHeap, &StorageState);
}

use crate::memory::STATE;
use crate::storage::cert::update_certified_data;
use crate::storage::types::state::FullPath;
use crate::types::state::RuntimeState;

/// Delete

pub fn delete_certified_asset(full_path: &FullPath) {
    STATE.with(|state| delete_certified_asset_impl(full_path, &mut state.borrow_mut().runtime));
}

pub fn delete_certified_asset_impl(full_path: &FullPath, runtime: &mut RuntimeState) {
    // 1. Remove the asset in tree
    runtime.storage.asset_hashes.delete(full_path);

    // 2. Update the root hash and the canister certified data
    update_certified_data(&runtime.storage.asset_hashes);
}

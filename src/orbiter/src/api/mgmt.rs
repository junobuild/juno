use crate::guards::{caller_is_admin_controller, caller_is_controller};
use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::canister::memory_size as canister_memory_size;
use junobuild_shared::mgmt::ic::deposit_cycles as deposit_cycles_shared;
use junobuild_shared::types::interface::{DepositCyclesArgs, MemorySize};

#[update(guard = "caller_is_admin_controller")]
async fn deposit_cycles(args: DepositCyclesArgs) {
    deposit_cycles_shared(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

#[query(guard = "caller_is_controller")]
fn memory_size() -> MemorySize {
    canister_memory_size()
}

use crate::guards::caller_is_admin_controller;
use ic_cdk::trap;
use ic_cdk_macros::update;
use junobuild_shared::mgmt::ic::deposit_cycles as deposit_cycles_shared;
use junobuild_shared::types::interface::DepositCyclesArgs;

#[update(guard = "caller_is_admin_controller")]
async fn deposit_cycles(args: DepositCyclesArgs) {
    deposit_cycles_shared(args)
        .await
        .unwrap_or_else(|e| trap(&e))
}

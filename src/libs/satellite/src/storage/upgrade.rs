use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use std::time::Duration;
use junobuild_storage::upgrade::init_certified_assets as init_runtime_certified_assets;
use crate::memory::STATE;
use crate::types::state::State;

/// If required, building the certification asset hashes is something we can also initiate "manually."
/// This is why we can avoid blocking the post_upgrade process. That way, the execution instructions are specifically scoped to the operation.
pub fn defer_init_certified_assets() {
    set_timer(Duration::ZERO, || spawn(init_certified_assets()));
}

async fn init_certified_assets() {
    STATE.with(|state| {
        init_certified_assets_impl(&state.borrow());
    });
}

fn init_certified_assets_impl(state: &State) {
    init_runtime_certified_assets(&state.heap.storage, &state.stable.assets)
}
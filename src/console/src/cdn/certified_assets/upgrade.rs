use crate::cdn::storage::init_certified_assets as init_runtime_certified_assets;
use ic_cdk::futures::spawn_017_compat;
use ic_cdk_timers::set_timer;
use std::time::Duration;

/// If required, building the certification asset hashes is something we can also initiate "manually."
/// This is why we can avoid blocking the post_upgrade process. That way, the execution instructions are specifically scoped to the operation.
pub fn defer_init_certified_assets() {
    set_timer(Duration::ZERO, || spawn_017_compat(init_certified_assets()));
}

async fn init_certified_assets() {
    init_runtime_certified_assets();
}

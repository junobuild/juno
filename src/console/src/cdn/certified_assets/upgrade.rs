use crate::cdn::storage::certify_all_assets;
use ic_cdk_timers::set_timer;
use std::time::Duration;

/// If required, building the certification asset hashes is something we can also initiate "manually."
/// This is why we can avoid blocking the post_upgrade process. That way, the execution instructions are specifically scoped to the operation.
pub fn defer_init_certified_assets() {
    set_timer(Duration::ZERO, async {
        init_certified_assets().await;
    });
}

async fn init_certified_assets() {
    certify_all_assets();
}

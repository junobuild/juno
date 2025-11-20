use crate::openid::certificate::schedule_certificate_update;
use crate::store::heap::{
    assert_scheduler_running, assert_scheduler_stopped, disable_scheduler, enable_scheduler,
};
use ic_cdk::futures::spawn;
use ic_cdk_timers::set_timer;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use std::time::Duration;

pub fn defer_restart_monitoring() {
    // Early spare one timer if not enabled.
    if assert_scheduler_running(&OpenIdProvider::Google).is_err() {
        return;
    }

    set_timer(Duration::ZERO, || spawn(restart_monitoring()));
}

async fn restart_monitoring() {
    schedule_certificate_update(OpenIdProvider::Google, None);
}

pub fn start_openid_scheduler() -> Result<(), String> {
    let provider = OpenIdProvider::Google;

    assert_scheduler_stopped(&provider)?;

    enable_scheduler(&provider);

    schedule_certificate_update(OpenIdProvider::Google, None);

    Ok(())
}

pub fn stop_openid_scheduler() -> Result<(), String> {
    let provider = OpenIdProvider::Google;

    assert_scheduler_running(&provider)?;

    disable_scheduler(&provider)
}

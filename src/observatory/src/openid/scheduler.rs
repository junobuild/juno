use crate::openid::certificate::schedule_certificate_update;
use crate::store::heap::{
    assert_scheduler_running, assert_scheduler_stopped, disable_scheduler, enable_scheduler,
    is_scheduler_enabled,
};
use ic_cdk_timers::set_timer;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use std::time::Duration;

pub fn defer_restart_monitoring() {
    // Early spare one timer if no scheduler is enabled.
    let enabled_count = [
        OpenIdProvider::Google,
        OpenIdProvider::GitHubAuth,
        OpenIdProvider::GitHubActions,
    ]
    .into_iter()
    .filter(is_scheduler_enabled)
    .count();

    if enabled_count == 0 {
        return;
    }

    set_timer(Duration::ZERO, async {
        restart_monitoring().await;
    });
}

async fn restart_monitoring() {
    for provider in [
        OpenIdProvider::Google,
        OpenIdProvider::GitHubAuth,
        OpenIdProvider::GitHubActions,
    ] {
        schedule_certificate_update(provider, None);
    }
}

pub fn start_openid_scheduler(provider: OpenIdProvider) -> Result<(), String> {
    assert_scheduler_stopped(&provider)?;

    enable_scheduler(&provider);

    schedule_certificate_update(provider, None);

    Ok(())
}

pub fn stop_openid_scheduler(provider: OpenIdProvider) -> Result<(), String> {
    assert_scheduler_running(&provider)?;

    disable_scheduler(&provider)
}

pub fn is_openid_scheduler_enabled(provider: OpenIdProvider) -> bool {
    is_scheduler_enabled(&provider)
}

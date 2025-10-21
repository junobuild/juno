use crate::openid::certificate::schedule_certificate_update;
use crate::store::heap::{
    assert_scheduler_running, assert_scheduler_stopped, disable_scheduler, enable_scheduler,
};
use crate::types::state::OpenIdProvider;

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

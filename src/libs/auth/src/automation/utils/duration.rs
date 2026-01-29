use crate::automation::constants::{DEFAULT_EXPIRATION_PERIOD_NS, MAX_EXPIRATION_PERIOD_NS};
use crate::openid::types::provider::OpenIdAutomationProvider;
use crate::state::get_automation;
use crate::strategies::AuthHeapStrategy;
use ic_cdk::api::time;
use std::cmp::min;

pub fn build_expiration(
    provider: &OpenIdAutomationProvider,
    auth_heap: &impl AuthHeapStrategy,
) -> u64 {
    let max_time_to_live = get_automation(auth_heap)
        .as_ref()
        .and_then(|automation| automation.openid.as_ref())
        .and_then(|openid| openid.providers.get(provider))
        .and_then(|openid| openid.controller.as_ref())
        .and_then(|controller| controller.max_time_to_live);

    let controller_duration = min(
        max_time_to_live.unwrap_or(DEFAULT_EXPIRATION_PERIOD_NS),
        MAX_EXPIRATION_PERIOD_NS,
    );

    time().saturating_add(controller_duration)
}

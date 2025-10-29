use crate::delegation::constants::{DEFAULT_EXPIRATION_PERIOD_NS, MAX_EXPIRATION_PERIOD_NS};
use crate::state::get_config;
use crate::strategies::AuthHeapStrategy;
use ic_cdk::api::time;
use std::cmp::min;

pub fn build_expiration(auth_heap: &impl AuthHeapStrategy) -> u64 {
    let max_time_to_live = get_config(auth_heap)
        .as_ref()
        .and_then(|config| config.openid.clone())
        .and_then(|openid| openid.delegation)
        .and_then(|delegation| delegation.max_time_to_live);

    let session_duration = min(
        max_time_to_live.unwrap_or(DEFAULT_EXPIRATION_PERIOD_NS),
        MAX_EXPIRATION_PERIOD_NS,
    );

    time().saturating_add(session_duration)
}

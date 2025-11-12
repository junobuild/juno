use crate::refresh::constants::{
    FAILURE_BACKOFF_BASE_NS, FAILURE_BACKOFF_CAP_NS, FAILURE_BACKOFF_MULTIPLIER,
    REFRESH_COOLDOWN_NS,
};
use crate::refresh::types::RefreshStatus;
use crate::state::types::state::OpenIdCachedCertificate;
use ic_cdk::api::time;

pub fn refresh_allowed(certificate: &Option<OpenIdCachedCertificate>) -> RefreshStatus {
    let Some(cached_certificate) = certificate.as_ref() else {
        // Certificate was never fetched.
        return RefreshStatus::AllowedFirstFetch;
    };

    let since_last_attempt = time().saturating_sub(cached_certificate.last_fetch_attempt.at);

    if since_last_attempt >= REFRESH_COOLDOWN_NS {
        return RefreshStatus::AllowedAfterCooldown;
    }

    let delay = attempt_backoff_ns(cached_certificate.last_fetch_attempt.streak_count);

    if since_last_attempt >= delay {
        RefreshStatus::AllowedRetry
    } else {
        RefreshStatus::Denied
    }
}

fn attempt_backoff_ns(streak_count: u8) -> u64 {
    let mut factor: u64 = 1;
    let mut n = streak_count.max(1).saturating_sub(1);

    while n > 0 {
        factor = factor.saturating_mul(FAILURE_BACKOFF_MULTIPLIER);
        n -= 1;
    }

    (FAILURE_BACKOFF_BASE_NS.saturating_mul(factor)).min(FAILURE_BACKOFF_CAP_NS)
}

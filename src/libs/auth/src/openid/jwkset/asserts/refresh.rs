use crate::delegation::types::Timestamp;
use crate::openid::jwkset::asserts::constants::{
    FAILURE_BACKOFF_BASE_NS, FAILURE_BACKOFF_CAP_NS, FAILURE_BACKOFF_MULTIPLIER,
    REFRESH_COOLDOWN_NS,
};
use crate::openid::jwkset::asserts::types::RefreshStatus;
use crate::state::types::state::OpenIdCachedCertificate;
use ic_cdk::api::time;

pub fn refresh_allowed(certificate: &Option<OpenIdCachedCertificate>) -> RefreshStatus {
    refresh_allowed_at(certificate, time())
}

fn refresh_allowed_at(
    certificate: &Option<OpenIdCachedCertificate>,
    now: Timestamp,
) -> RefreshStatus {
    let Some(cached_certificate) = certificate.as_ref() else {
        // Certificate was never fetched.
        return RefreshStatus::AllowedFirstFetch;
    };

    let since_last_attempt = now.saturating_sub(cached_certificate.last_fetch_attempt.at);

    if since_last_attempt >= REFRESH_COOLDOWN_NS {
        return RefreshStatus::AllowedAfterCooldown;
    }

    let delay = attempt_backoff_ns(cached_certificate.last_fetch_attempt.streak_count);

    // Once we exceed the backoff cap, no more retries until full cooldown
    // 0s -> 30s -> 60s -> 2min ... 15min
    if delay > FAILURE_BACKOFF_CAP_NS {
        return RefreshStatus::Denied;
    }

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

    FAILURE_BACKOFF_BASE_NS.saturating_mul(factor)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::types::state::OpenIdLastFetchAttempt;

    const fn secs(n: u64) -> u64 {
        n * 1_000_000_000
    }
    const fn mins(n: u64) -> u64 {
        secs(n * 60)
    }

    fn make_cached(at: u64, streak: u8) -> OpenIdCachedCertificate {
        OpenIdCachedCertificate {
            certificate: None,
            last_fetch_attempt: OpenIdLastFetchAttempt {
                at,
                streak_count: streak,
            },
        }
    }

    #[test]
    fn none_means_allowed_first_fetch() {
        let cert: Option<OpenIdCachedCertificate> = None;
        assert!(matches!(
            refresh_allowed_at(&cert, 0),
            RefreshStatus::AllowedFirstFetch
        ));
    }

    #[test]
    fn cooldown_allows_at_or_after_15min() {
        let start = 1_000;
        let cert = Some(make_cached(start, 1));

        // exactly at 15 min → AllowedAfterCooldown
        assert!(matches!(
            refresh_allowed_at(&cert, start + REFRESH_COOLDOWN_NS),
            RefreshStatus::AllowedAfterCooldown
        ));

        // well after 15 min → AllowedAfterCooldown
        assert!(matches!(
            refresh_allowed_at(&cert, start + REFRESH_COOLDOWN_NS + secs(1)),
            RefreshStatus::AllowedAfterCooldown
        ));
    }

    #[test]
    fn backoff_streak_1_is_30s_boundary_inclusive() {
        let start = 10_000;
        let cert = Some(make_cached(start, 1));

        // just before 30s → denied
        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(30) - 1),
            RefreshStatus::Denied
        ));

        // at 30s → AllowedRetry
        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(30)),
            RefreshStatus::AllowedRetry
        ));
    }

    #[test]
    fn backoff_streak_2_is_60s_boundary_inclusive() {
        let start = 20_000;
        let cert = Some(make_cached(start, 2));

        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(60) - 1),
            RefreshStatus::Denied
        ));
        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(60)),
            RefreshStatus::AllowedRetry
        ));
    }

    #[test]
    fn backoff_streak_3_caps_at_120s() {
        let start = 30_000;
        let cert = Some(make_cached(start, 3));

        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(120) - 1),
            RefreshStatus::Denied
        ));
        assert!(matches!(
            refresh_allowed_at(&cert, start + secs(120)),
            RefreshStatus::AllowedRetry
        ));
    }

    #[test]
    fn streak_4_and_above_requires_cooldown() {
        let start = 40_000;
        for streak in [4u8, 10, u8::MAX] {
            let cert = Some(make_cached(start, streak));
            assert!(matches!(
                refresh_allowed_at(&cert, start + mins(15) - 1),
                RefreshStatus::Denied
            ));
            assert!(matches!(
                refresh_allowed_at(&cert, start + mins(15)),
                RefreshStatus::AllowedAfterCooldown
            ));
        }
    }

    #[test]
    fn attempt_backoff_formula_matches_constants() {
        // streak 1 => 30s
        assert_eq!(attempt_backoff_ns(1), secs(30));
        // streak 2 => 60s
        assert_eq!(attempt_backoff_ns(2), secs(60));
        // streak 3 => 120s
        assert_eq!(attempt_backoff_ns(3), mins(2));
        // streak 4+ => bigger than 120s, no cap
        assert!(attempt_backoff_ns(4) > mins(2));
    }

    #[test]
    fn no_retries_after_cap_until_cooldown() {
        let start = 50_000;
        let cert = Some(make_cached(start, 4)); // beyond cap

        // At 2 min (the cap) → still denied because we exceeded cap
        assert!(matches!(
            refresh_allowed_at(&cert, start + mins(2)),
            RefreshStatus::Denied
        ));

        // At 10 min → still denied (within cooldown)
        assert!(matches!(
            refresh_allowed_at(&cert, start + mins(10)),
            RefreshStatus::Denied
        ));

        // At 15 min → finally allowed again
        assert!(matches!(
            refresh_allowed_at(&cert, start + REFRESH_COOLDOWN_NS),
            RefreshStatus::AllowedAfterCooldown
        ));
    }
}

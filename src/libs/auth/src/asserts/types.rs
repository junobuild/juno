use crate::delegation::types::Timestamp;

pub enum RefreshStatus {
    AllowedFirstFetch,
    AllowedAfterCooldown,
    AllowedRetry,
    Denied,
}

pub trait AssertRefreshRecord {
    fn last_attempt_at(&self) -> Timestamp;
    fn last_attempt_streak_count(&self) -> u8;
}

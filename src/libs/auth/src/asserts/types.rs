use crate::delegation::types::Timestamp;

pub enum RefreshStatus {
    AllowedFirstFetch,
    AllowedAfterCooldown,
    AllowedRetry,
    Denied,
}

pub trait AssertRefreshCertificate {
    fn last_refresh_at(&self) -> Timestamp;
    fn refresh_count(&self) -> u8;
}

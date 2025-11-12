pub enum RefreshStatus {
    AllowedFirstFetch,
    AllowedAfterCooldown,
    AllowedRetry,
    Denied,
}

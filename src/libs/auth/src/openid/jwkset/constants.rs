// After successfully fetching a certificate we wait 15min before allowing
// the Satellite to request it again.
pub const REFRESH_COOLDOWN_NS: u64 = 15 * 60 * 1_000_000_000;

// Backoff when fetching the certificate returns None or fails
pub const FAILURE_BACKOFF_BASE_NS: u64 = 30 * 1_000_000_000; // 30s
pub const FAILURE_BACKOFF_MULTIPLIER: u64 = 2; // doubles on each failure
pub const FAILURE_BACKOFF_CAP_NS: u64 = 2 * 60 * 1_000_000_000; // cap at 2 min. 30s/60s/120s, three tries

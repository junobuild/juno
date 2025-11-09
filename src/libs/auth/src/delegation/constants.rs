const MINUTE_NS: u64 = 60 * 1_000_000_000;
const HOUR_NS: u64 = 60 * MINUTE_NS;
const DAY_NS: u64 = 24 * HOUR_NS;

// 1 day in nanoseconds
pub const DEFAULT_EXPIRATION_PERIOD_NS: u64 = DAY_NS;

// The maximum expiration time for delegation set to a month
pub const MAX_EXPIRATION_PERIOD_NS: u64 = 30 * DAY_NS;

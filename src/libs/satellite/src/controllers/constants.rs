const MINUTE_NS: u64 = 60 * 1_000_000_000;

// 10 minutes in nanoseconds
pub const DEFAULT_CONTROLLER_DURATION_NS: u64 = 10 * MINUTE_NS;

// The maximum duration for a automation controller
pub const MAX_CONTROLLER_DURATION_NS: u64 = 60 * MINUTE_NS;

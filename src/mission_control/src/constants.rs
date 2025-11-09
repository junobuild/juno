// We archive statuses in memory up to 30 days (1h * 24 * 30).
pub const RETAIN_ARCHIVE_STATUSES_NS: u64 = 3_600_000_000_000 * 24 * 30;

// We run the monitoring one per hour.
pub const MONITORING_INTERVAL_SECONDS: u64 = 60 * 60;

// We send no more than one funding failure email a day to keep devs from being spammed.
pub const DELAY_BETWEEN_FUNDING_FAILURE_NOTIFICATION_NS: u64 = 86_400_000_000_000; // 1 day in nanoseconds

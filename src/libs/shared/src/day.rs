use crate::types::utils::CalendarDate;
use time::{Duration, OffsetDateTime, Time};

/// Converts a Unix timestamp (in nanoseconds) to an `OffsetDateTime`.
///
/// # Arguments
/// - `timestamp`: A reference to a `u64` Unix timestamp in nanoseconds.
///
/// # Returns
/// An `OffsetDateTime` representing the given timestamp.
///
/// # Panics
/// Panics if the conversion to a timestamp fails, which can happen if the value
/// represents a time outside the valid range that `OffsetDateTime` can represent.
fn to_date(timestamp: &u64) -> OffsetDateTime {
    let nanoseconds = *timestamp as i64;
    let seconds = nanoseconds / 1_000_000_000;
    let nanos_remainder = nanoseconds % 1_000_000_000;

    OffsetDateTime::from_unix_timestamp(seconds).unwrap() + Duration::nanoseconds(nanos_remainder)
}

/// Returns the day of the year for a given timestamp.
///
/// # Arguments
/// - `timestamp`: A reference to a `u64` Unix timestamp in nanoseconds.
///
/// # Returns
/// The day of the year as `usize`, ranging from 1 to 366.
pub fn day_of_the_year(timestamp: &u64) -> usize {
    let ordinal = to_date(timestamp).ordinal();

    ordinal as usize
}

/// Converts a Unix timestamp (in nanoseconds) to a `CalendarDate`.
///
/// # Arguments
/// - `timestamp`: A reference to a `u64` Unix timestamp in nanoseconds.
///
/// # Returns
/// A `CalendarDate` representing the date of the given timestamp.
pub fn calendar_date(timestamp: &u64) -> CalendarDate {
    CalendarDate::from(&to_date(timestamp).to_calendar_date())
}

/// Converts a Unix timestamp (in nanoseconds) to the start of its day (00:00:00 UTC).
///
/// # Arguments
/// - `timestamp`: A reference to a `u64` Unix timestamp in nanoseconds.
///
/// # Returns
/// - `Ok(u64)` containing the nanosecond timestamp at the start of the day.
/// - `Err(String)` if the conversion to midnight fails.
///
/// # Errors
/// This function returns an error if constructing the midnight time fails,
/// or if the resulting timestamp cannot be safely converted to `u64`.
pub fn start_of_day(timestamp: &u64) -> Result<u64, String> {
    let datetime = to_date(timestamp);
    let date_only = datetime.date();

    let midnight = Time::from_hms(0, 0, 0)
        .map_err(|e| format!("Failed to create midnight time: {e}"))?;

    let start_of_day = date_only.with_time(midnight);
    let nanos = start_of_day.assume_utc().unix_timestamp_nanos();

    nanos.try_into().map_err(|_| "Timestamp too large for u64".to_string())
}
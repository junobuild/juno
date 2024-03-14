use crate::types::utils::CalendarDate;
use time::{Duration, OffsetDateTime};

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

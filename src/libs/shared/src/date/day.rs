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

#[cfg(test)]
mod tests {
    use super::*;
    use time::format_description::well_known::Rfc3339;
    use time::OffsetDateTime;

    fn ts_ns(rfc3339: &str) -> u64 {
        OffsetDateTime::parse(rfc3339, &Rfc3339)
            .unwrap()
            .unix_timestamp_nanos()
            .try_into()
            .unwrap()
    }

    #[test]
    fn day_of_the_year_regular_year() {
        // 2025-10-21 is day 294 (non-leap year)
        let t = ts_ns("2025-10-21T00:00:00Z");
        assert_eq!(day_of_the_year(&t), 294);
    }

    #[test]
    fn day_of_the_year_leap_year() {
        // 2024-03-01 is day 61 (Jan 31 + Feb 29 + 1)
        let t = ts_ns("2024-03-01T00:00:00Z");
        assert_eq!(day_of_the_year(&t), 61);
    }

    #[test]
    fn calendar_date_is_same_within_day() {
        // Same calendar day, different times → same CalendarDate
        let morning = ts_ns("2025-10-21T00:00:00Z");
        let night = ts_ns("2025-10-21T23:59:59Z");

        let a = calendar_date(&morning);
        let b = calendar_date(&night);

        assert_eq!(a, b);
    }
}

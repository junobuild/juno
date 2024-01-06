use crate::types::utils::CalendarDate;
use time::{Duration, OffsetDateTime};

fn to_date(timestamp: &u64) -> OffsetDateTime {
    let nanoseconds = *timestamp as i64;
    let seconds = nanoseconds / 1_000_000_000;
    let nanos_remainder = nanoseconds % 1_000_000_000;

    OffsetDateTime::from_unix_timestamp(seconds).unwrap() + Duration::nanoseconds(nanos_remainder)
}

pub fn day_of_the_year(timestamp: &u64) -> usize {
    let ordinal = to_date(timestamp).ordinal();

    ordinal as usize
}

pub fn calendar_date(timestamp: &u64) -> CalendarDate {
    CalendarDate::from(&to_date(timestamp).to_calendar_date())
}

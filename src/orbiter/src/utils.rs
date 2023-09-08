use ic_cdk::print;
use time::{Duration, OffsetDateTime};

pub fn day(timestamp: &u64) -> usize {
    let nanoseconds = *timestamp as i64;
    let seconds = nanoseconds / 1_000_000_000;
    let nanos_remainder = nanoseconds % 1_000_000_000;
    let date = OffsetDateTime::from_unix_timestamp(seconds).unwrap() + Duration::nanoseconds(nanos_remainder as i64);

    let ordinal = date.ordinal();

    print(format!("Hello the ordinal day number is: {:?} ", ordinal));

    ordinal as usize
}
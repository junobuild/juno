use ic_cdk::print;
use time::{Duration, OffsetDateTime};

pub fn month(timestamp: &u64) -> usize {
    let nanoseconds = *timestamp as i64;
    let seconds = nanoseconds / 1_000_000_000;
    let nanos_remainder = nanoseconds % 1_000_000_000;
    let date = OffsetDateTime::from_unix_timestamp(seconds).unwrap()
        + Duration::nanoseconds(nanos_remainder as i64);

    let month = date.month();

    print(format!("Hello the month is: {:?} ", month));

    month as usize
}

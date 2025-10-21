use time::format_description::well_known::Rfc2822;
use time::OffsetDateTime;

/// Parses a date-time string (e.g., RFC 2822 / RFC 1123 format)
/// into a Unix timestamp in nanoseconds.
///
/// # Arguments
/// - `value`: The date-time string, e.g. `"Tue, 21 Oct 2025 11:05:06 GMT"`.
///
/// # Returns
/// `Some(timestamp_ns)` if parsed successfully, otherwise `None`.
///
/// # Examples
/// ```
/// let ts = parse_text_datetime_ns("Tue, 21 Oct 2025 11:05:06 GMT");
/// assert!(ts.is_some());
/// ```
pub fn parse_text_datetime_ns(value: &str) -> Option<u64> {
    OffsetDateTime::parse(value, &Rfc2822)
        .ok()
        .and_then(|dt| dt.unix_timestamp_nanos().try_into().ok())
}

#[cfg(test)]
mod tests {
    use super::*;
    use time::OffsetDateTime;

    #[test]
    fn parses_valid_rfc2822_date() {
        let input = "Tue, 21 Oct 2025 11:05:06 GMT";
        let result = parse_text_datetime_ns(input);

        assert!(result.is_some(), "expected valid timestamp for {}", input);

        let ts_ns = result.unwrap();
        let dt = OffsetDateTime::from_unix_timestamp_nanos(ts_ns as i128).unwrap();
        assert_eq!(dt.year(), 2025);
        assert_eq!(dt.month().to_string(), "October");
        assert_eq!(dt.day(), 21);
        assert_eq!(dt.hour(), 11);
        assert_eq!(dt.minute(), 5);
        assert_eq!(dt.second(), 6);
    }

    #[test]
    fn returns_none_for_invalid_input() {
        let invalids = [
            "",
            "2025-10-21T11:05:06Z", // RFC3339, not RFC2822
            "not a date",
        ];

        for input in invalids {
            assert!(
                parse_text_datetime_ns(input).is_none(),
                "expected None for invalid input '{}'",
                input
            );
        }
    }
}

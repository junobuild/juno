use crate::errors::JUNO_ERROR_INVALID_REGEX;
use regex::Regex;

/// Compiles a regular expression from the given pattern string.
///
/// # Arguments
///
/// * `pattern` - A string slice that holds the regex pattern to compile.
///
/// # Returns
///
/// * `Ok(Regex)` if the pattern is valid.
/// * `Err(String)` with a detailed error message including the `JUNO_ERROR_INVALID_REGEX` constant if compilation fails.
pub fn build_regex(pattern: &str) -> Result<Regex, String> {
    Regex::new(pattern).map_err(|e| format!("{JUNO_ERROR_INVALID_REGEX} (`{pattern}`: {e})"))
}

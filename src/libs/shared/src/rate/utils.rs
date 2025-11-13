use crate::rate::types::{RateConfig, RateTokenStore, RateTokens};
use crate::types::state::Timestamp;
use ic_cdk::api::time;
use std::cmp::min;

pub fn increment_and_assert_rate_store(
    key: &String,
    config: &Option<RateConfig>,
    rate_tokens: &mut RateTokenStore,
) -> Result<(), String> {
    let config = match config {
        Some(config) => config,
        None => return Ok(()),
    };

    if let Some(tokens) = rate_tokens.get_mut(key) {
        increment_and_assert_rate(config, tokens)?;
    } else {
        rate_tokens.insert(key.clone(), RateTokens::default());
    }

    Ok(())
}

pub fn increment_and_assert_rate(
    config: &RateConfig,
    tokens: &mut RateTokens,
) -> Result<(), String> {
    increment_and_assert_rate_at(config, tokens, time())
}

fn increment_and_assert_rate_at(
    config: &RateConfig,
    tokens: &mut RateTokens,
    now: Timestamp,
) -> Result<(), String> {
    if config.time_per_token_ns == 0 {
        return Err("Invalid rate configuration: time_per_token_ns cannot be zero.".to_string());
    }

    let elapsed = now.saturating_sub(tokens.updated_at);
    let new_tokens = elapsed / config.time_per_token_ns;

    if new_tokens > 0 {
        // The number of tokens is capped otherwise tokens might accumulate
        tokens.tokens = min(config.max_tokens, tokens.tokens.saturating_add(new_tokens));
        tokens.updated_at += config.time_per_token_ns * new_tokens;
    }

    // deduct a token for the current call
    if tokens.tokens > 0 {
        tokens.tokens -= 1;
        Ok(())
    } else {
        Err("Rate limit reached, try again later.".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cfg(time_per_token_ns: u64, max_tokens: u64) -> RateConfig {
        RateConfig {
            time_per_token_ns,
            max_tokens,
        }
    }

    #[test]
    fn refills_tokens_up_to_max_and_consumes_one() {
        let config = cfg(10, 5);

        let mut tokens = RateTokens {
            tokens: 0,
            updated_at: 0,
        };

        // now = 100 → new_tokens = (100 - 0) / 10 = 10 → capped to 5
        let result = increment_and_assert_rate_at(&config, &mut tokens, 100);

        assert!(result.is_ok());
        // 5 tokens refilled - 1 consumed
        assert_eq!(tokens.tokens, 4);
        // updated_at advanced by 10 * 10 = 100 (uses new_tokens, not capped)
        assert_eq!(tokens.updated_at, 100);
    }

    #[test]
    fn returns_error_when_no_tokens_available() {
        let config = cfg(1000, 1);

        // updated_at == now → no refill
        let mut tokens = RateTokens {
            tokens: 0,
            updated_at: 5000,
        };

        let result = increment_and_assert_rate_at(&config, &mut tokens, 5000);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Rate limit reached, try again later.");
        assert_eq!(tokens.tokens, 0);
    }

    #[test]
    fn consumes_one_token_when_available_without_refill() {
        let config = cfg(1000, 10);

        let mut tokens = RateTokens {
            tokens: 3,
            updated_at: 10_000,
        };

        // now - updated_at < time_per_token_ns → no refill
        let result = increment_and_assert_rate_at(&config, &mut tokens, 10_999);

        assert!(result.is_ok());
        assert_eq!(tokens.tokens, 2);
        assert_eq!(tokens.updated_at, 10_000);
    }

    #[test]
    fn no_refill_when_not_enough_time_passed() {
        let config = cfg(100, 10);

        let mut tokens = RateTokens {
            tokens: 5,
            updated_at: 1000,
        };

        // Not enough time to generate a new token
        let result = increment_and_assert_rate_at(&config, &mut tokens, 1099);

        assert!(result.is_ok());
        assert_eq!(tokens.tokens, 4); // just consumed
        assert_eq!(tokens.updated_at, 1000);
    }

    // ---------- Edge cases ----------

    #[test]
    fn max_tokens_zero_never_allows_call() {
        // Even with huge elapsed time, max_tokens = 0 means no usable tokens.
        let config = cfg(1, 0);

        let mut tokens = RateTokens {
            tokens: 0,
            updated_at: 0,
        };

        let result = increment_and_assert_rate_at(&config, &mut tokens, 1_000_000);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Rate limit reached, try again later.");
        assert_eq!(tokens.tokens, 0);
        // updated_at advanced, but that doesn't give us usable tokens
        assert!(tokens.updated_at > 0);
    }

    #[test]
    fn huge_elapsed_time_saturates_at_max_tokens_and_consumes_one() {
        let config = cfg(1, 5);

        let mut tokens = RateTokens {
            tokens: 0,
            updated_at: 0,
        };

        // Very large now; new_tokens will be huge but capped by max_tokens.
        let now = u64::MAX;

        let result = increment_and_assert_rate_at(&config, &mut tokens, now);

        assert!(result.is_ok());
        // Saturated to 5, then consumed 1
        assert_eq!(tokens.tokens, 4);
        // updated_at advanced by new_tokens * time_per_token_ns = u64::MAX
        assert_eq!(tokens.updated_at, now);
    }

    #[test]
    fn returns_error_when_time_per_token_is_zero() {
        let config = cfg(0, 10); // invalid configuration

        let mut tokens = RateTokens {
            tokens: 5,
            updated_at: 1000,
        };

        let result = increment_and_assert_rate_at(&config, &mut tokens, 2000);

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            "Invalid rate configuration: time_per_token_ns cannot be zero."
        );

        // Ensure no mutation happened
        assert_eq!(tokens.tokens, 5);
        assert_eq!(tokens.updated_at, 1000);
    }
}

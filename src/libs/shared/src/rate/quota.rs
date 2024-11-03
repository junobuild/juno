use crate::rate::types::Rate;
use ic_cdk::api::time;
use std::cmp::min;

pub fn increment_and_assert_rate(rate: &mut Rate) -> Result<(), String> {
    let new_tokens = (time() - rate.tokens.updated_at) / rate.config.time_per_token_ns;
    if new_tokens > 0 {
        // The number of tokens is capped otherwise tokens might accumulate
        rate.tokens.tokens = min(rate.config.max_tokens, rate.tokens.tokens + new_tokens);
        rate.tokens.updated_at += rate.config.time_per_token_ns * new_tokens;
    }

    // deduct a token for the current call
    if rate.tokens.tokens > 0 {
        rate.tokens.tokens -= 1;
        Ok(())
    } else {
        Err("Rate limit reached, try again later.".to_string())
    }
}

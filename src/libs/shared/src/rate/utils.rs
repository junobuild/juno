use crate::rate::types::{RateConfig, RateTokenStore, RateTokens};
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
    let new_tokens = (time() - tokens.updated_at) / config.time_per_token_ns;
    if new_tokens > 0 {
        // The number of tokens is capped otherwise tokens might accumulate
        tokens.tokens = min(config.max_tokens, tokens.tokens + new_tokens);
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

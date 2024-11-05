use crate::rate::constants::DEFAULT_RATE_CONFIG;
use crate::rate::types::{RateConfig, RateTokens};
use ic_cdk::api::time;

impl Default for RateTokens {
    fn default() -> Self {
        let now = time();

        RateTokens {
            tokens: 1,
            updated_at: now,
        }
    }
}

impl Default for RateConfig {
    fn default() -> Self {
        DEFAULT_RATE_CONFIG
    }
}

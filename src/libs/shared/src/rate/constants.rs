use crate::rate::types::RateConfig;

// Rates
// 60000000000 = 1min
pub const DEFAULT_RATE_CONFIG: RateConfig = RateConfig {
    max_tokens: 10,
    time_per_token_ns: 60000000000,
};

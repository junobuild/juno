use crate::rate::types::RateConfig;

// Rates
// 600_000_000 nano seconds = 0.6 seconds
pub const DEFAULT_RATE_CONFIG: RateConfig = RateConfig {
    max_tokens: 100,
    time_per_token_ns: 600_000_000,
};

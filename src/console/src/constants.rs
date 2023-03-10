use crate::types::state::RateConfig;
use ic_ledger_types::Tokens;

// 0.5 ICP
pub const SATELLITE_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// Rates
pub const SATELLITES_RATE_CONFIG: RateConfig = RateConfig {
    max_tokens: 1,
    time_per_token_ns: 600000000000,
};

use crate::types::state::RateConfig;
use ic_ledger_types::Tokens;

// 0.5 ICP
pub const SATELLITE_CREATION_FEE_ICP: Tokens = Tokens::from_e8s(50_000_000);

// Rates
// 60000000000 = 1min
pub const DEFAULT_RATE_CONFIG: RateConfig = RateConfig {
    max_tokens: 10,
    time_per_token_ns: 60000000000,
};

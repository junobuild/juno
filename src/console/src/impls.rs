use crate::constants::{DEFAULT_RATE_CONFIG, ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_ICP};
use crate::types::state::{Fee, Fees, Rate, RateTokens, Rates};
use ic_cdk::api::time;

impl Default for Rates {
    fn default() -> Self {
        let now = time();

        let tokens: RateTokens = RateTokens {
            tokens: 1,
            updated_at: now,
        };

        Rates {
            satellites: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            mission_controls: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            orbiters: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens,
            },
        }
    }
}

impl Default for Fees {
    fn default() -> Self {
        let now = time();

        Fees {
            satellite: Fee {
                fee: SATELLITE_CREATION_FEE_ICP,
                updated_at: now,
            },
            orbiter: Fee {
                fee: ORBITER_CREATION_FEE_ICP,
                updated_at: now,
            },
        }
    }
}

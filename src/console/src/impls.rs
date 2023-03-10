use crate::constants::SATELLITES_RATE_CONFIG;
use crate::types::state::{Rate, RateTokens, Rates};
use ic_cdk::api::time;

impl Default for Rates {
    fn default() -> Self {
        let now = time();

        let tokens: RateTokens = RateTokens {
            tokens: 0,
            updated_at: now,
        };

        Rates {
            satellites: Rate {
                config: SATELLITES_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            mission_controls: Rate {
                config: SATELLITES_RATE_CONFIG,
                tokens,
            },
        }
    }
}

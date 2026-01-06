use crate::types::state::{FactoryRate, FactoryRates};
use ic_cdk::api::time;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::types::state::SegmentKind;
use std::collections::HashMap;

pub fn init_factory_rates() -> FactoryRates {
    let now = time();

    let tokens: RateTokens = RateTokens {
        tokens: 1,
        updated_at: now,
    };

    HashMap::from([
        (
            SegmentKind::Satellite,
            FactoryRate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
        ),
        (
            SegmentKind::Orbiter,
            FactoryRate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
        ),
        (
            SegmentKind::MissionControl,
            FactoryRate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
        ),
        (
            SegmentKind::Canister,
            FactoryRate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
        ),
    ])
}

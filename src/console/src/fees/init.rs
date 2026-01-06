use crate::constants::{
    MISSION_CONTROL_CREATION_FEE_CYCLES, ORBITER_CREATION_FEE_CYCLES, ORBITER_CREATION_FEE_ICP,
    SATELLITE_CREATION_FEE_CYCLES, SATELLITE_CREATION_FEE_ICP,
};
use crate::types::state::{FactoryFee, FactoryFees, FactoryRate, FactoryRates};
use ic_cdk::api::time;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::types::state::SegmentKind;
use std::collections::HashMap;

pub fn init_factory_fees() -> FactoryFees {
    let now = time();

    HashMap::from([
        (
            SegmentKind::Satellite,
            FactoryFee {
                fee_cycles: SATELLITE_CREATION_FEE_CYCLES,
                fee_icp: Some(SATELLITE_CREATION_FEE_ICP),
                updated_at: now,
            },
        ),
        (
            SegmentKind::Orbiter,
            FactoryFee {
                fee_cycles: ORBITER_CREATION_FEE_CYCLES,
                fee_icp: Some(ORBITER_CREATION_FEE_ICP),
                updated_at: now,
            },
        ),
        (
            SegmentKind::MissionControl,
            FactoryFee {
                fee_cycles: MISSION_CONTROL_CREATION_FEE_CYCLES,
                fee_icp: None,
                updated_at: now,
            },
        ),
    ])
}

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
    ])
}

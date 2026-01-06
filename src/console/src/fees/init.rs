use crate::constants::{
    CANISTER_CREATION_FEE_CYCLES, MISSION_CONTROL_CREATION_FEE_CYCLES, ORBITER_CREATION_FEE_CYCLES,
    ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_CYCLES, SATELLITE_CREATION_FEE_ICP,
};
use crate::types::state::{FactoryFee, FactoryFees};
use ic_cdk::api::time;
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
        (
            SegmentKind::Canister,
            FactoryFee {
                fee_cycles: CANISTER_CREATION_FEE_CYCLES,
                fee_icp: None,
                updated_at: now,
            },
        ),
    ])
}

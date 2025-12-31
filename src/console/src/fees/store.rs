use crate::fees::init::default_factory_fees;
use crate::store::{mutate_heap_state, with_factory_fees};
use crate::types::interface::FeesArgs;
use crate::types::state::{FactoryFee, FactoryFees, HeapState};
use ic_cdk::api::time;
use junobuild_shared::types::state::SegmentKind;

pub fn get_factory_fee(segment_kind: &SegmentKind) -> Result<FactoryFee, String> {
    with_factory_fees(|factory_fees| get_factory_fee_impl(segment_kind, factory_fees))
}

fn get_factory_fee_impl(
    segment_kind: &SegmentKind,
    factory_fees: &Option<FactoryFees>,
) -> Result<FactoryFee, String> {
    if let Some(fees) = factory_fees {
        if let Some(fee) = fees.get(segment_kind) {
            return Ok(fee.clone());
        }
    }

    default_factory_fees()
        .get(segment_kind)
        .cloned()
        .ok_or_else(|| format!("Fee not found for segment kind: {:?}", segment_kind))
}

pub fn set_factory_fee(segment_kind: &SegmentKind, fee: &FeesArgs) -> Result<(), String> {
    mutate_heap_state(|state| set_factory_fee_impl(segment_kind, fee, state))
}

fn set_factory_fee_impl(
    segment_kind: &SegmentKind,
    fee: &FeesArgs,
    state: &mut HeapState,
) -> Result<(), String> {
    let fees = state.factory_fees.get_or_insert_with(default_factory_fees);

    let target = fees
        .get_mut(segment_kind)
        .ok_or_else(|| format!("Fee not initialized for segment kind: {:?}", segment_kind))?;

    target.fee_icp = fee.fee_icp;
    target.fee_cycles = fee.fee_cycles.clone();
    target.updated_at = time();

    Ok(())
}

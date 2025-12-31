use crate::store::{with_factory_fees, with_factory_fees_mut};
use crate::types::interface::FeesArgs;
use crate::types::state::{FactoryFee, FactoryFees};
use ic_cdk::api::time;
use ic_ledger_types::Tokens;
use junobuild_shared::types::state::SegmentKind;

pub fn get_factory_fee(segment_kind: &SegmentKind) -> Result<FactoryFee, String> {
    with_factory_fees(|factory_fees| get_factory_fee_impl(segment_kind, factory_fees))
}

pub fn get_factory_fee_icp(segment_kind: &SegmentKind) -> Result<Tokens, String> {
    get_factory_fee(segment_kind)?
        .fee_icp
        .ok_or_else(|| format!("ICP fee not available for {:?}", segment_kind))
}

fn get_factory_fee_impl(
    segment_kind: &SegmentKind,
    factory_fees: &Option<FactoryFees>,
) -> Result<FactoryFee, String> {
    factory_fees
        .as_ref()
        .and_then(|fees| fees.get(segment_kind))
        .cloned()
        .ok_or_else(|| format!("Fee not found for segment kind: {:?}", segment_kind))
}

pub fn set_factory_fee(segment_kind: &SegmentKind, fee: &FeesArgs) -> Result<(), String> {
    with_factory_fees_mut(|factory_fees| set_factory_fee_impl(segment_kind, fee, factory_fees))
}

fn set_factory_fee_impl(
    segment_kind: &SegmentKind,
    fee: &FeesArgs,
    factory_fees: &mut Option<FactoryFees>,
) -> Result<(), String> {
    let fees = factory_fees
        .as_mut()
        .ok_or_else(|| "Factory fees not initialized".to_string())?;

    let target = fees
        .get_mut(segment_kind)
        .ok_or_else(|| format!("Fee not initialized for segment kind: {:?}", segment_kind))?;

    target.fee_icp = fee.fee_icp;
    target.fee_cycles = fee.fee_cycles.clone();
    target.updated_at = time();

    Ok(())
}

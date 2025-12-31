use crate::fees::types::FeeKind;
use crate::fees::{get_factory_fee, get_factory_fee_icp};
use crate::types::ledger::Fee;
use junobuild_shared::types::state::SegmentKind;

pub fn get_factory_fee_for_kind(
    segment_kind: &SegmentKind,
    fee_kind: FeeKind,
) -> Result<Fee, String> {
    match fee_kind {
        FeeKind::Cycles => {
            let fee = get_factory_fee(segment_kind)?.fee_cycles;
            Ok(Fee::Cycles(fee))
        }
        FeeKind::ICP => {
            let fee = get_factory_fee_icp(segment_kind)?;
            Ok(Fee::ICP(fee))
        }
    }
}

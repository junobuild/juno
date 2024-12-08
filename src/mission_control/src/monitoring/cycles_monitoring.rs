use canfund::FundManager;
use junobuild_shared::types::state::SegmentId;
use crate::monitoring::init_funding::init_register_options;
use crate::types::state::CyclesMonitoringStrategy;

pub fn register_cycles_monitoring(
    fund_manager: &mut FundManager,
    segment_id: &SegmentId,
    strategy: &CyclesMonitoringStrategy,
) -> Result<(), String> {
    // Register does not overwrite the configuration. That's why we unregister first given that we support updating configuration.
    fund_manager.unregister(*segment_id);
    fund_manager.register(*segment_id, init_register_options(strategy)?);
    Ok(())
}
use crate::memory::RUNTIME_STATE;
use crate::types::interface::{CyclesMonitoringConfig, SegmentsMonitoringStrategy};
use crate::types::runtime::RuntimeState;
use canfund::manager::RegisterOpts;
use crate::monitoring::funding::{init_funding_manager};

pub fn start_cycles_monitoring(config: &CyclesMonitoringConfig) -> Result<(), String> {
    if let Some(strategy) = &config.satellites_strategy {
        start_satellites_monitoring(strategy)?;
    }

    Ok(())
}

fn start_satellites_monitoring(
    segments_strategy: &SegmentsMonitoringStrategy,
) -> Result<(), String> {
    start_monitoring(segments_strategy)
}

fn start_monitoring(segments_strategy: &SegmentsMonitoringStrategy) -> Result<(), String> {
    RUNTIME_STATE.with(|state| start_monitoring_impl(segments_strategy, &mut state.borrow_mut()))
}

fn start_monitoring_impl(
    segments_strategy: &SegmentsMonitoringStrategy,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    let fund_strategy = segments_strategy.strategy.to_fund_strategy()?;

    for segment_id in &segments_strategy.ids {
        // Register does not overwrite the configuration. That's why we unregister first given that we support updating configuration.
        fund_manager.unregister(*segment_id);
        fund_manager.register(
            *segment_id,
            RegisterOpts::new().with_strategy(fund_strategy.clone()),
        );
    }

    Ok(())
}

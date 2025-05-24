use crate::memory::manager::RUNTIME_STATE;
use crate::monitoring::cycles::funding::init_funding_manager;
use crate::monitoring::store::heap::disable_mission_control_monitoring;
use crate::types::runtime::RuntimeState;
use ic_cdk::id;
use junobuild_shared::types::state::SegmentId;

type DisableMonitoring = fn(&SegmentId) -> Result<(), String>;

pub fn unregister_modules_monitoring(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
) -> Result<(), String> {
    RUNTIME_STATE.with(|state| {
        unregister_modules_monitoring_impl(segment_ids, disable_monitoring, &mut state.borrow_mut())
    })
}

pub fn unregister_mission_control_monitoring() -> Result<(), String> {
    RUNTIME_STATE.with(|state| unregister_mission_control_monitoring_impl(&mut state.borrow_mut()))
}

fn unregister_modules_monitoring_impl(
    segment_ids: &Vec<SegmentId>,
    disable_monitoring: DisableMonitoring,
    state: &mut RuntimeState,
) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    for segment_id in segment_ids {
        disable_monitoring(segment_id)?;

        fund_manager.unregister(*segment_id);
    }

    Ok(())
}

fn unregister_mission_control_monitoring_impl(state: &mut RuntimeState) -> Result<(), String> {
    let fund_manager = state.fund_manager.get_or_insert_with(init_funding_manager);

    let strategy_exists = fund_manager.get_canisters();

    if strategy_exists.len() > 1 {
        return Err(
            "Mission control monitoring cannot be disabled while some modules remain active."
                .to_string(),
        );
    }

    disable_mission_control_monitoring()?;

    fund_manager.unregister(id());

    Ok(())
}

use crate::memory::STATE;
use crate::types::state::{CyclesMonitoringStrategy, HeapState, Orbiters, Satellites, Settings};
use junobuild_shared::types::state::{OrbiterId, SatelliteId};

pub fn set_mission_control_strategy(strategy: &CyclesMonitoringStrategy) {
    STATE.with(|state| set_mission_control_setting_impl(strategy, &mut state.borrow_mut().heap))
}

pub fn set_satellite_strategy(
    satellite_id: &SatelliteId,
    strategy: &CyclesMonitoringStrategy,
) -> Result<(), String> {
    STATE.with(|state| {
        set_satellite_setting_impl(
            satellite_id,
            strategy,
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

pub fn set_orbiter_strategy(
    orbiter_id: &OrbiterId,
    strategy: &CyclesMonitoringStrategy,
) -> Result<(), String> {
    STATE.with(|state| {
        set_orbiter_setting_impl(orbiter_id, strategy, &mut state.borrow_mut().heap.orbiters)
    })
}

fn set_mission_control_setting_impl(strategy: &CyclesMonitoringStrategy, state: &mut HeapState) {
    state.settings = Some(Settings::from(strategy));
}

fn set_satellite_setting_impl(
    satellite_id: &SatelliteId,
    strategy: &CyclesMonitoringStrategy,
    satellites: &mut Satellites,
) -> Result<(), String> {
    let satellite = satellites.get(satellite_id).ok_or_else(|| {
        format!(
            "Satellite {} not found. Strategy cannot be saved.",
            satellite_id.to_text()
        )
    })?;

    let update_satellite = satellite.clone_with_settings(&Settings::from(strategy));

    satellites.insert(*satellite_id, update_satellite);

    Ok(())
}

fn set_orbiter_setting_impl(
    orbiter_id: &OrbiterId,
    strategy: &CyclesMonitoringStrategy,
    orbiters: &mut Orbiters,
) -> Result<(), String> {
    let orbiter = orbiters.get(orbiter_id).ok_or_else(|| {
        format!(
            "Orbiter {} not found. Strategy cannot be saved.",
            orbiter_id.to_text()
        )
    })?;

    let update_orbiter = orbiter.clone_with_settings(&Settings::from(strategy));

    orbiters.insert(*orbiter_id, update_orbiter);

    Ok(())
}

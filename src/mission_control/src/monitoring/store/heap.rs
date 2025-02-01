use crate::memory::STATE;
use crate::types::state::{
    CyclesMonitoringStrategy, HeapState, MissionControlSettings, Orbiters,
    Satellites, Settings,
};
use junobuild_shared::types::state::{OrbiterId, SatelliteId};

pub fn set_mission_control_strategy(strategy: &CyclesMonitoringStrategy) {
    STATE.with(|state| set_mission_control_strategy_impl(strategy, &mut state.borrow_mut().heap))
}

pub fn enable_mission_control_monitoring() -> Result<(), String> {
    STATE.with(|state| toggle_mission_control_monitoring_impl(true, &mut state.borrow_mut().heap))
}

pub fn disable_mission_control_monitoring() -> Result<(), String> {
    STATE.with(|state| toggle_mission_control_monitoring_impl(false, &mut state.borrow_mut().heap))
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

pub fn enable_satellite_monitoring(satellite_id: &SatelliteId) -> Result<(), String> {
    STATE.with(|state| {
        toggle_satellite_monitoring_impl(
            satellite_id,
            true,
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

pub fn enable_orbiter_monitoring(orbiter_id: &OrbiterId) -> Result<(), String> {
    STATE.with(|state| {
        toggle_orbiter_monitoring_impl(orbiter_id, true, &mut state.borrow_mut().heap.orbiters)
    })
}

pub fn disable_satellite_monitoring(satellite_id: &SatelliteId) -> Result<(), String> {
    STATE.with(|state| {
        toggle_satellite_monitoring_impl(
            satellite_id,
            false,
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

pub fn disable_orbiter_monitoring(orbiter_id: &OrbiterId) -> Result<(), String> {
    STATE.with(|state| {
        toggle_orbiter_monitoring_impl(orbiter_id, false, &mut state.borrow_mut().heap.orbiters)
    })
}

fn set_mission_control_strategy_impl(strategy: &CyclesMonitoringStrategy, state: &mut HeapState) {
    state.settings = Some(
        state
            .settings
            .as_ref()
            .map(|settings| settings.clone_with_strategy(strategy))
            .unwrap_or_else(|| MissionControlSettings::from_strategy(strategy)),
    );
}

fn toggle_mission_control_monitoring_impl(
    enable: bool,
    state: &mut HeapState,
) -> Result<(), String> {
    let settings = state
        .settings
        .clone()
        .ok_or_else(|| "Settings not found for mission control.".to_string())?;

    let update_settings = settings.toggle_cycles_monitoring(enable)?;

    state.settings = Some(update_settings);

    Ok(())
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

fn toggle_satellite_monitoring_impl(
    satellite_id: &SatelliteId,
    enabled: bool,
    satellites: &mut Satellites,
) -> Result<(), String> {
    let satellite = satellites.get(satellite_id).ok_or_else(|| {
        format!(
            "Satellite {} not found. Monitoring cannot be disabled.",
            satellite_id.to_text()
        )
    })?;

    let update_satellite = satellite.toggle_cycles_monitoring(enabled)?;

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

fn toggle_orbiter_monitoring_impl(
    orbiter_id: &OrbiterId,
    enabled: bool,
    orbiters: &mut Orbiters,
) -> Result<(), String> {
    let orbiter = orbiters.get(orbiter_id).ok_or_else(|| {
        format!(
            "Orbiter {} not found. Monitoring cannot be disabled.",
            orbiter_id.to_text()
        )
    })?;

    let update_orbiter = orbiter.toggle_cycles_monitoring(enabled)?;

    orbiters.insert(*orbiter_id, update_orbiter);

    Ok(())
}

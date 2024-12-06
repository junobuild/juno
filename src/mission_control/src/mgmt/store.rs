use crate::types::core::Segment;
use crate::types::state::{HeapState, Monitoring, MonitoringStrategy, Orbiter, Satellite, Settings};
use crate::STATE;
use junobuild_shared::types::state::{OrbiterId, SatelliteId};
use std::collections::HashMap;
use std::hash::Hash;

///
/// Settings
///

pub fn set_mission_control_monitoring_strategy(strategy: &MonitoringStrategy) {
    STATE.with(|state| {
        set_mission_control_monitoring_strategy_impl(strategy, &mut state.borrow_mut().heap)
    })
}

pub fn set_mission_control_monitoring_strategy_impl(
    strategy: &MonitoringStrategy,
    state: &mut HeapState,
) {
    let settings = state.settings.get_or_insert_with(Settings::default);

    settings
        .monitoring
        .get_or_insert_with(Monitoring::default)
        .cycles_strategy = Some(strategy.clone());
}

pub fn set_satellite_monitoring_strategy(
    satellite_id: &SatelliteId,
    strategy: &MonitoringStrategy,
) -> Result<Satellite, String> {
    STATE.with(|state| {
        set_monitoring_strategy_impl(
            satellite_id,
            strategy,
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

pub fn set_orbiter_monitoring_strategy(
    orbiter_id: &OrbiterId,
    strategy: &MonitoringStrategy,
) -> Result<Orbiter, String> {
    STATE.with(|state| {
        set_monitoring_strategy_impl(
            orbiter_id,
            strategy,
            &mut state.borrow_mut().heap.orbiters,
        )
    })
}

fn set_monitoring_strategy_impl<K: Eq + Hash + Copy, T: Clone + Segment<K>>(
    id: &K,
    strategy: &MonitoringStrategy,
    state: &mut HashMap<K, T>,
) -> Result<T, String> {
    let segment = state.get(id);

    match segment {
        None => Err("No segment found.".to_string()),
        Some(segment) => {
            let update_segment = segment.set_monitoring_strategy(strategy);

            state.insert(*id, update_segment.clone());

            Ok(update_segment)
        }
    }
}

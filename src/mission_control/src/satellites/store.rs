use crate::types::state::{Satellite, Satellites, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::SatelliteId;
use std::collections::HashMap;

/// Satellites

pub fn get_satellites() -> Satellites {
    STATE.with(|state| get_satellites_impl(&state.borrow().stable))
}

fn get_satellites_impl(state: &StableState) -> Satellites {
    state.satellites.clone()
}

pub fn add_satellite(satellite: &SatelliteId, name: &str) -> Satellite {
    STATE.with(|state| add_satellite_impl(satellite, name, &mut state.borrow_mut().stable))
}

fn add_satellite_impl(satellite: &SatelliteId, name: &str, state: &mut StableState) -> Satellite {
    let now = time();

    let new_satellite = Satellite {
        satellite_id: *satellite,
        metadata: HashMap::from([("name".to_string(), name.to_owned())]),
        created_at: now,
        updated_at: now,
    };

    state.satellites.insert(*satellite, new_satellite.clone());

    new_satellite
}

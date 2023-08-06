use crate::types::state::{Orbiter, Orbiters, Satellite, Satellites, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{Metadata, SatelliteId};
use std::collections::HashMap;
use std::hash::Hash;

/// Satellites

pub fn get_satellites() -> Satellites {
    STATE.with(|state| state.borrow().stable.satellites.clone())
}

pub fn add_satellite(satellite_id: &SatelliteId, name: &str) -> Satellite {
    STATE.with(|state| {
        add_segment(
            satellite_id,
            &Satellite::from(satellite_id, name),
            &mut state.borrow_mut().stable.satellites,
        )
    })
}

pub fn set_satellite_metadata(
    satellite_id: &SatelliteId,
    metadata: &Metadata,
) -> Result<Satellite, String> {
    STATE.with(|state| set_metadata_impl(satellite_id, metadata, &mut state.borrow_mut().stable))
}

fn set_metadata_impl(
    satellite_id: &SatelliteId,
    metadata: &Metadata,
    state: &mut StableState,
) -> Result<Satellite, String> {
    let satellite = state.satellites.get(satellite_id);

    match satellite {
        None => Err("No satellite found.".to_string()),
        Some(satellite) => {
            let now = time();

            let update_satellite = Satellite {
                satellite_id: satellite.satellite_id,
                metadata: metadata.clone(),
                created_at: satellite.created_at,
                updated_at: now,
            };

            state
                .satellites
                .insert(*satellite_id, update_satellite.clone());

            Ok(update_satellite)
        }
    }
}

/// Orbiters

pub fn get_orbiters() -> Orbiters {
    STATE.with(|state| state.borrow().stable.orbiters.clone())
}

pub fn add_orbiter(orbiter_id: &SatelliteId, name: &str) -> Orbiter {
    STATE.with(|state| {
        add_segment(
            orbiter_id,
            &Orbiter::from(orbiter_id, name),
            &mut state.borrow_mut().stable.orbiters,
        )
    })
}

/// Segments

fn add_segment<K: Eq + Hash + Copy, T: Clone>(id: &K, value: &T, state: &mut HashMap<K, T>) -> T {
    state.insert(*id, value.clone());

    value.clone()
}

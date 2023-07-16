use crate::types::state::{Satellite, Satellites, StableState};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{Metadata, SatelliteId};
use std::collections::HashMap;

/// Satellites

pub fn get_satellites() -> Satellites {
    STATE.with(|state| get_satellites_impl(&state.borrow().stable))
}

fn get_satellites_impl(state: &StableState) -> Satellites {
    state.satellites.clone()
}

pub fn add_satellite(satellite_id: &SatelliteId, name: &str) -> Satellite {
    STATE.with(|state| add_satellite_impl(satellite_id, name, &mut state.borrow_mut().stable))
}

fn add_satellite_impl(
    satellite_id: &SatelliteId,
    name: &str,
    state: &mut StableState,
) -> Satellite {
    let now = time();

    let new_satellite = Satellite {
        satellite_id: *satellite_id,
        metadata: HashMap::from([("name".to_string(), name.to_owned())]),
        created_at: now,
        updated_at: now,
    };

    state
        .satellites
        .insert(*satellite_id, new_satellite.clone());

    new_satellite
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

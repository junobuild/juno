use crate::memory::manager::STATE;
use crate::types::core::Segment;
use crate::types::state::{Orbiter, Orbiters, Satellite, Satellites, Ufo, Ufos};
use junobuild_shared::types::state::{Metadata, OrbiterId, SatelliteId, UfoId};
use std::collections::HashMap;
use std::hash::Hash;

// ---------------------------------------------------------
// Satellites
// ---------------------------------------------------------

pub fn get_satellites() -> Satellites {
    STATE.with(|state| state.borrow().heap.satellites.clone())
}

pub fn get_satellite(satellite_id: &SatelliteId) -> Option<Satellite> {
    STATE.with(|state| get_segment_impl(satellite_id, &state.borrow().heap.satellites))
}

pub fn delete_satellite(satellite_id: &SatelliteId) -> Option<Satellite> {
    STATE.with(|state| delete_segment_impl(satellite_id, &mut state.borrow_mut().heap.satellites))
}

pub fn add_satellite(satellite_id: &SatelliteId, name: &Option<String>) -> Satellite {
    STATE.with(|state| {
        add_segment_impl(
            satellite_id,
            &Satellite::from(satellite_id, name),
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

pub fn set_satellite_metadata(
    satellite_id: &SatelliteId,
    metadata: &Metadata,
) -> Result<Satellite, String> {
    STATE.with(|state| {
        set_metadata_impl(
            satellite_id,
            metadata,
            &mut state.borrow_mut().heap.satellites,
        )
    })
}

// ---------------------------------------------------------
// Orbiters
// ---------------------------------------------------------

pub fn get_orbiters() -> Orbiters {
    STATE.with(|state| state.borrow().heap.orbiters.clone())
}

pub fn get_orbiter(orbiter_id: &OrbiterId) -> Option<Orbiter> {
    STATE.with(|state| get_segment_impl(orbiter_id, &state.borrow().heap.orbiters))
}

pub fn delete_orbiter(orbiter_id: &OrbiterId) -> Option<Orbiter> {
    STATE.with(|state| delete_segment_impl(orbiter_id, &mut state.borrow_mut().heap.orbiters))
}

pub fn add_orbiter(orbiter_id: &OrbiterId, name: &Option<String>) -> Orbiter {
    STATE.with(|state| {
        add_segment_impl(
            orbiter_id,
            &Orbiter::from(orbiter_id, name),
            &mut state.borrow_mut().heap.orbiters,
        )
    })
}

pub fn set_orbiter_metadata(
    orbiter_id: &OrbiterId,
    metadata: &Metadata,
) -> Result<Orbiter, String> {
    STATE.with(|state| {
        set_metadata_impl(orbiter_id, metadata, &mut state.borrow_mut().heap.orbiters)
    })
}

// ---------------------------------------------------------
// UFOs
// ---------------------------------------------------------

pub fn get_ufos() -> Ufos {
    STATE.with(|state| state.borrow().heap.ufos.clone().unwrap_or_default())
}

pub fn get_ufo(ufo_id: &UfoId) -> Option<Ufo> {
    STATE.with(|state| {
        state
            .borrow()
            .heap
            .ufos
            .as_ref()
            .and_then(|ufos| get_segment_impl(ufo_id, ufos))
    })
}

pub fn delete_ufo(ufo_id: &UfoId) -> Option<Ufo> {
    STATE.with(|state| {
        delete_segment_impl(
            ufo_id,
            state
                .borrow_mut()
                .heap
                .ufos
                .get_or_insert_with(HashMap::new),
        )
    })
}

pub fn add_ufo(ufo_id: &UfoId, name: &Option<String>) -> Ufo {
    STATE.with(|state| {
        add_segment_impl(
            ufo_id,
            &Ufo::from(ufo_id, name),
            state
                .borrow_mut()
                .heap
                .ufos
                .get_or_insert_with(HashMap::new),
        )
    })
}

pub fn set_ufo_metadata(ufo_id: &UfoId, metadata: &Metadata) -> Result<Ufo, String> {
    STATE.with(|state| {
        set_metadata_impl(
            ufo_id,
            metadata,
            state
                .borrow_mut()
                .heap
                .ufos
                .get_or_insert_with(HashMap::new),
        )
    })
}

// ---------------------------------------------------------
// Segments
// ---------------------------------------------------------

fn add_segment_impl<K: Eq + Hash + Copy, T: Clone>(
    id: &K,
    value: &T,
    state: &mut HashMap<K, T>,
) -> T {
    state.insert(*id, value.clone());

    value.clone()
}

fn delete_segment_impl<K: Eq + Hash + Copy, T: Clone>(
    id: &K,
    state: &mut HashMap<K, T>,
) -> Option<T> {
    state.remove(id)
}

fn get_segment_impl<K: Eq + Hash + Copy, T: Clone>(id: &K, state: &HashMap<K, T>) -> Option<T> {
    state.get(id).cloned()
}

fn set_metadata_impl<K: Eq + Hash + Copy, T: Clone + Segment<K>>(
    id: &K,
    metadata: &Metadata,
    state: &mut HashMap<K, T>,
) -> Result<T, String> {
    let segment = state.get(id);

    match segment {
        None => Err("No segment found.".to_string()),
        Some(segment) => {
            let update_segment = segment.set_metadata(metadata);

            state.insert(*id, update_segment.clone());

            Ok(update_segment)
        }
    }
}

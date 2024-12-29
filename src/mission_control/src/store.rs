use crate::memory::STATE;
use crate::types::state::{
    ArchiveStatusesSegments, HeapState, MissionControlSettings, Statuses, User,
};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_shared::types::state::{Metadata, OrbiterId, SatelliteId, UserId};

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().heap.user.user).unwrap()
}

pub fn get_settings() -> Option<MissionControlSettings> {
    STATE.with(|state| state.borrow().heap.settings.clone())
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().heap))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut HeapState) {
    let now = time();

    let updated_user = User {
        user: state.user.user,
        metadata: metadata.clone(),
        created_at: state.user.created_at,
        updated_at: now,
    };

    state.user = updated_user;
}

// ---------------------------------------------------------
// Statuses
// ---------------------------------------------------------

#[deprecated]
pub fn list_mission_control_statuses() -> Statuses {
    STATE.with(|state| state.borrow().heap.archive.statuses.mission_control.clone())
}

#[deprecated]
pub fn list_satellite_statuses(satellite_id: &SatelliteId) -> Option<Statuses> {
    STATE.with(|state| {
        list_segment_statuses_impl(
            satellite_id,
            &state.borrow().heap.archive.statuses.satellites,
        )
    })
}

#[deprecated]
pub fn list_orbiter_statuses(orbiter_id: &OrbiterId) -> Option<Statuses> {
    STATE.with(|state| {
        list_segment_statuses_impl(orbiter_id, &state.borrow().heap.archive.statuses.orbiters)
    })
}

fn list_segment_statuses_impl(id: &Principal, state: &ArchiveStatusesSegments) -> Option<Statuses> {
    state.get(id).cloned()
}

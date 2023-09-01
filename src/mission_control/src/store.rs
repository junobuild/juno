use crate::constants::RETAIN_ARCHIVE_STATUSES_NS;
use crate::types::state::{ArchiveStatusesSegments, StableState, Statuses, User};
use crate::STATE;
use candid::Principal;
use ic_cdk::api::time;
use shared::types::state::{Metadata, OrbiterId, SatelliteId, SegmentStatusResult, UserId};
use std::collections::BTreeMap;

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().stable.user.user).unwrap()
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().stable))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut StableState) {
    let now = time();

    let updated_user = User {
        user: state.user.user,
        metadata: metadata.clone(),
        created_at: state.user.created_at,
        updated_at: now,
    };

    state.user = updated_user;
}

///
/// Statuses
///

pub fn set_mission_control_status(status: &SegmentStatusResult) {
    STATE.with(|state| set_mission_control_status_impl(status, &mut state.borrow_mut().stable))
}

fn set_mission_control_status_impl(status: &SegmentStatusResult, state: &mut StableState) {
    let now = time();
    let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;

    state
        .archive
        .statuses
        .mission_control
        .retain(|timestamp, _| *timestamp >= retain_timestamp);

    state
        .archive
        .statuses
        .mission_control
        .insert(now, status.clone());
}

pub fn list_mission_control_statuses() -> Statuses {
    STATE.with(|state| {
        state
            .borrow()
            .stable
            .archive
            .statuses
            .mission_control
            .clone()
    })
}

pub fn set_satellite_status(satellite_id: &SatelliteId, status: &SegmentStatusResult) {
    STATE.with(|state| {
        set_segment_status_impl(
            satellite_id,
            status,
            &mut state.borrow_mut().stable.archive.statuses.satellites,
        )
    })
}

pub fn set_orbiter_status(orbiter_id: &OrbiterId, status: &SegmentStatusResult) {
    STATE.with(|state| {
        set_segment_status_impl(
            orbiter_id,
            status,
            &mut state.borrow_mut().stable.archive.statuses.orbiters,
        )
    })
}

fn set_segment_status_impl(
    id: &Principal,
    status: &SegmentStatusResult,
    state: &mut ArchiveStatusesSegments,
) {
    let archive = state.get(id);

    match archive {
        None => {
            state.insert(*id, BTreeMap::from([(time(), status.clone())]));
        }
        Some(archive) => {
            let now = time();
            let retain_timestamp = now - RETAIN_ARCHIVE_STATUSES_NS;

            let mut updated_archive = archive.clone();

            updated_archive.retain(|timestamp, _| *timestamp >= retain_timestamp);
            updated_archive.insert(now, status.clone());

            state.insert(*id, updated_archive);
        }
    }
}

pub fn list_satellite_statuses(satellite_id: &SatelliteId) -> Option<Statuses> {
    STATE.with(|state| {
        list_segment_statuses_impl(
            satellite_id,
            &state.borrow().stable.archive.statuses.satellites,
        )
    })
}

pub fn list_orbiter_statuses(orbiter_id: &OrbiterId) -> Option<Statuses> {
    STATE.with(|state| {
        list_segment_statuses_impl(orbiter_id, &state.borrow().stable.archive.statuses.orbiters)
    })
}

fn list_segment_statuses_impl(id: &Principal, state: &ArchiveStatusesSegments) -> Option<Statuses> {
    state.get(id).cloned()
}

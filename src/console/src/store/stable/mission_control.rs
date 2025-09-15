use crate::constants::E8S_PER_ICP;
use crate::store::services::{mutate_stable_state, read_stable_state};
use crate::types::state::{MissionControl, MissionControls, MissionControlsStable, StableState};
use ic_cdk::api::time;
use junobuild_shared::structures::collect_stable_map_from;
use junobuild_shared::types::state::{MissionControlId, UserId};
use junobuild_shared::utils::principal_equal;

pub fn get_mission_control(user: &UserId) -> Result<Option<MissionControl>, &'static str> {
    read_stable_state(|stable| get_mission_control_impl(user, stable))
}

fn get_mission_control_impl(
    user: &UserId,
    state: &StableState,
) -> Result<Option<MissionControl>, &'static str> {
    let mission_control = state.mission_controls.get(user);

    match mission_control {
        None => Ok(None),
        Some(mission_control) => {
            if principal_equal(*user, mission_control.owner) {
                return Ok(Some(mission_control.clone()));
            }

            Err("User does not have the permission for the mission control.")
        }
    }
}

pub fn get_existing_mission_control(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<MissionControl, &'static str> {
    read_stable_state(|stable| get_existing_mission_control_impl(user, mission_control_id, stable))
}

fn get_existing_mission_control_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &StableState,
) -> Result<MissionControl, &'static str> {
    let existing_mission_control = state.mission_controls.get(user);

    match existing_mission_control {
        None => Err("User does not have a mission control center."),
        Some(existing_mission_control) => match existing_mission_control.mission_control_id {
            None => Err("User mission control center does not exist yet."),
            Some(existing_mission_control_id) => {
                if principal_equal(existing_mission_control_id, *mission_control_id) {
                    return Ok(existing_mission_control.clone());
                }

                Err("User does not have the permission to access the mission control center.")
            }
        },
    }
}

pub fn init_empty_mission_control(user: &UserId) {
    mutate_stable_state(|stable| init_empty_mission_control_impl(user, stable))
}

fn init_empty_mission_control_impl(user: &UserId, state: &mut StableState) {
    let now = time();

    let mission_control = MissionControl {
        mission_control_id: None,
        owner: *user,
        credits: E8S_PER_ICP,
        created_at: now,
        updated_at: now,
    };

    state.mission_controls.insert(*user, mission_control);
}

pub fn add_mission_control(user: &UserId, mission_control_id: &MissionControlId) -> MissionControl {
    mutate_stable_state(|stable| add_mission_control_impl(user, mission_control_id, stable))
}

fn add_mission_control_impl(
    user: &UserId,
    mission_control_id: &MissionControlId,
    state: &mut StableState,
) -> MissionControl {
    let now = time();

    // We know for sure that we have created an empty mission control center
    let mission_control = state.mission_controls.get(user).unwrap();

    let finalized_mission_control = MissionControl {
        owner: mission_control.owner,
        mission_control_id: Some(*mission_control_id),
        credits: mission_control.credits,
        created_at: mission_control.created_at,
        updated_at: now,
    };

    state
        .mission_controls
        .insert(*user, finalized_mission_control.clone());

    finalized_mission_control
}

pub fn delete_mission_control(user: &UserId) -> Option<MissionControl> {
    mutate_stable_state(|stable| delete_mission_control_impl(user, stable))
}

fn delete_mission_control_impl(user: &UserId, state: &mut StableState) -> Option<MissionControl> {
    state.mission_controls.remove(user)
}

pub fn list_mission_controls() -> MissionControls {
    read_stable_state(|stable| list_mission_controls_impl(&stable.mission_controls))
}

fn list_mission_controls_impl(mission_controls: &MissionControlsStable) -> MissionControls {
    collect_stable_map_from(mission_controls)
}

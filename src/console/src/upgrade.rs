use crate::{
    store::list_mission_controls_heap,
    types::state::{MissionControls, StableState},
    STATE,
};
use ic_cdk::spawn;
use ic_cdk_timers::set_timer;
use std::time::Duration;

// One time migration of the mission controls from heap to stable
pub fn defer_migrate_mission_controls() {
    set_timer(Duration::ZERO, || spawn(migrate_mission_controls()));
}

async fn migrate_mission_controls() {
    let mission_controls = list_mission_controls_heap();

    STATE.with(|state| insert_mission_controls(&mission_controls, &mut state.borrow_mut().stable));
}

fn insert_mission_controls(mission_controls: &MissionControls, state: &mut StableState) {
    for (user_id, mission_control) in mission_controls.iter() {
        state
            .mission_controls
            .insert(*user_id, mission_control.clone());
    }
}

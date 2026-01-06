use crate::factory::mission_control::create_mission_control as create_mission_control_console;
use crate::factory::orbiter::create_orbiter as create_orbiter_console;
use crate::factory::satellite::create_satellite as create_satellite_console;
use candid::Principal;
use ic_cdk_macros::update;
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::{
    CreateMissionControlArgs, CreateOrbiterArgs, CreateSatelliteArgs, CreateSegmentArgs,
};
use crate::factory::canister::create_canister;

#[update]
async fn create_mission_control(args: CreateMissionControlArgs) -> Principal {
    let caller = caller();

    create_mission_control_console(caller, args)
        .await
        .unwrap_or_trap()
}

#[update]
async fn create_satellite(args: CreateSatelliteArgs) -> Principal {
    let caller = caller();

    create_satellite_console(caller, args)
        .await
        .unwrap_or_trap()
}

#[update]
async fn create_orbiter(args: CreateOrbiterArgs) -> Principal {
    let caller = caller();

    create_orbiter_console(caller, args).await.unwrap_or_trap()
}

#[update]
async fn create_segment(args: CreateSegmentArgs) -> Principal {
    let caller = caller();

    let result = match args {
        CreateSegmentArgs::Satellite(args) => create_satellite_console(caller, args).await,
        CreateSegmentArgs::MissionControl(args) => {
            create_mission_control_console(caller, args).await
        }
        CreateSegmentArgs::Orbiter(args) => create_orbiter_console(caller, args).await,
        CreateSegmentArgs::Canister(args) => create_canister(caller, args).await,
    };

    result.unwrap_or_trap()
}

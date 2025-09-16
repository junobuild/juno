use crate::factory::orbiter::create_orbiter as create_orbiter_console;
use crate::factory::satellite::create_satellite as create_satellite_console;
use candid::Principal;
use ic_cdk_macros::update;
use junobuild_shared::ic::api::{caller, id};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::interface::CreateCanisterArgs;

#[update]
async fn create_satellite(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_satellite_console(console, caller, args)
        .await
        .unwrap_or_trap()
}

#[update]
async fn create_orbiter(args: CreateCanisterArgs) -> Principal {
    let console = id();
    let caller = caller();

    create_orbiter_console(console, caller, args)
        .await
        .unwrap_or_trap()
}

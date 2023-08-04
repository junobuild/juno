use crate::controllers::remove_console_controller_from_satellite;
use crate::factory::canister::{create_canister_with_credits, create_canister_with_payment};
use crate::store::{get_existing_mission_control, has_credits, increment_satellites_rate};
use crate::wasm::satellite_wasm_arg;
use candid::Principal;
use shared::constants::CREATE_SATELLITE_CYCLES;
use shared::ic::create_canister_install_code;
use shared::types::interface::CreateSatelliteArgs;
use shared::types::state::{MissionControlId, UserId};

pub async fn create_satellite(
    console: Principal,
    caller: Principal,
    CreateSatelliteArgs { user, block_index }: CreateSatelliteArgs,
) -> Result<Principal, String> {
    // User should have a mission control center
    let mission_control = get_existing_mission_control(&user, &caller)?;

    match mission_control.mission_control_id {
        None => Err("No mission control center found.".to_string()),
        Some(mission_control_id) => {
            if has_credits(&user, &mission_control_id) {
                // Guard too many requests
                increment_satellites_rate()?;

                return create_canister_with_credits(
                    create_satellite_wasm,
                    console,
                    mission_control_id,
                    user,
                )
                .await;
            }

            create_canister_with_payment(
                create_satellite_wasm,
                console,
                caller,
                mission_control_id,
                CreateSatelliteArgs { user, block_index },
            )
            .await
        }
    }
}

async fn create_satellite_wasm(
    console: Principal,
    mission_control_id: MissionControlId,
    user: UserId,
) -> Result<Principal, String> {
    let wasm_arg = satellite_wasm_arg(&user, &mission_control_id);
    let result = create_canister_install_code(
        Vec::from([console, mission_control_id, user]),
        &wasm_arg,
        CREATE_SATELLITE_CYCLES,
    )
    .await;

    match result {
        Err(error) => Err(error),
        Ok(satellite_id) => {
            remove_console_controller_from_satellite(&satellite_id, &user, &mission_control_id)
                .await?;
            Ok(satellite_id)
        }
    }
}

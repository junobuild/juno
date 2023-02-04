use crate::STATE;
use candid::{Encode, Principal};
use shared::types::ic::WasmArg;
use shared::types::interface::{MissionControlArgs, MissionControlId, SatelliteArgs, UserId};

pub fn mission_control_wasm_arg(user: &UserId) -> WasmArg {
    let wasm: Vec<u8> =
        STATE.with(|state| state.borrow().stable.releases.mission_control.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&MissionControlArgs { user: *user }).unwrap();
    WasmArg { wasm, install_arg }
}

pub fn satellite_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> WasmArg {
    let wasm: Vec<u8> = STATE.with(|state| state.borrow().stable.releases.satellite.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&SatelliteArgs {
        controllers: satellite_controllers(user, mission_control_id)
    })
    .unwrap();
    WasmArg { wasm, install_arg }
}

pub fn satellite_controllers(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Vec<Principal> {
    Vec::from([*user, *mission_control_id])
}

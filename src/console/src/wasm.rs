use crate::STATE;
use candid::{Encode, Principal};
use shared::types::ic::WasmArg;
use shared::types::interface::{MissionControlArgs, SegmentArgs};
use shared::types::state::{MissionControlId, UserId};

pub fn mission_control_wasm_arg(user: &UserId) -> WasmArg {
    let wasm: Vec<u8> =
        STATE.with(|state| state.borrow().stable.releases.mission_control.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&MissionControlArgs { user: *user }).unwrap();
    WasmArg { wasm, install_arg }
}

pub fn satellite_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> WasmArg {
    let wasm: Vec<u8> = STATE.with(|state| state.borrow().stable.releases.satellite.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&SegmentArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .unwrap();
    WasmArg { wasm, install_arg }
}

pub fn orbiter_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> WasmArg {
    let wasm: Vec<u8> = STATE.with(|state| state.borrow().stable.releases.orbiter.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&SegmentArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .unwrap();
    WasmArg { wasm, install_arg }
}

pub fn user_mission_control_controllers(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Vec<Principal> {
    Vec::from([*user, *mission_control_id])
}

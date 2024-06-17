use candid::{Encode, Principal};
use junobuild_shared::types::ic::WasmArg;
use junobuild_shared::types::interface::{MissionControlArgs, SegmentArgs};
use junobuild_shared::types::state::{MissionControlId, UserId};
use crate::memory::STATE;

pub fn mission_control_wasm_arg(user: &UserId) -> WasmArg {
    let wasm: Vec<u8> =
        STATE.with(|state| state.borrow().heap.releases.mission_control.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&MissionControlArgs { user: *user }).unwrap();
    WasmArg { wasm, install_arg }
}

pub fn satellite_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> WasmArg {
    let wasm: Vec<u8> = STATE.with(|state| state.borrow().heap.releases.satellite.wasm.clone());
    let install_arg: Vec<u8> = Encode!(&SegmentArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .unwrap();
    WasmArg { wasm, install_arg }
}

pub fn orbiter_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> WasmArg {
    let wasm: Vec<u8> = STATE.with(|state| state.borrow().heap.releases.orbiter.wasm.clone());
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

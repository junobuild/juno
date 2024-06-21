use candid::{Encode, Principal};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::ic::WasmArg;
use junobuild_shared::types::interface::{MissionControlArgs, SegmentArgs};
use junobuild_shared::types::state::{MissionControlId, UserId};
use junobuild_storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use junobuild_storage::types::state::FullPath;
use crate::storage::state::heap::get_asset;

fn get_chunks(full_path: &FullPath) -> Result<Blob, String> {
    let asset = match get_asset(full_path) {
        Some(asset) => asset,
        None => return Err(format!("No asset found for {}", full_path)),
    };

    let encoding = asset.encodings.get(ASSET_ENCODING_NO_COMPRESSION);

    match encoding {
        None => Err(format!("No identity encoding found for {}", full_path)),
        Some(encoding) => {
            let content_chunks: Blob = encoding.content_chunks.iter().flat_map(|chunk| chunk.iter().cloned()).collect();

            Ok(content_chunks)
        }
    }
}

pub fn mission_control_wasm_arg(user: &UserId) -> Result<WasmArg, String> {
    let wasm: Blob = get_chunks(&"/releases/mission_control.wasm.gz".to_string())?;
    let install_arg: Vec<u8> = Encode!(&MissionControlArgs { user: *user }).unwrap();
    Ok(WasmArg { wasm, install_arg })
}

pub fn satellite_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> Result<WasmArg, String> {
    let wasm: Blob = get_chunks(&"/releases/satellite.wasm.gz".to_string())?;
    let install_arg: Vec<u8> = Encode!(&SegmentArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .unwrap();
    Ok(WasmArg { wasm, install_arg })
}

pub fn orbiter_wasm_arg(user: &UserId, mission_control_id: &MissionControlId) -> Result<WasmArg, String> {
    let wasm: Blob = get_chunks(&"/releases/orbiter.wasm.gz".to_string())?;
    let install_arg: Vec<u8> = Encode!(&SegmentArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .unwrap();
    Ok(WasmArg { wasm, install_arg })
}

pub fn user_mission_control_controllers(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Vec<Principal> {
    Vec::from([*user, *mission_control_id])
}

use crate::cdn::helpers::heap::get_asset;
use crate::store::heap::{
    get_latest_mission_control_version, get_latest_orbiter_version, get_latest_satellite_version,
};
use candid::{Encode, Principal};
use junobuild_shared::mgmt::types::ic::WasmArg;
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::interface::{
    InitMissionControlArgs, InitOrbiterArgs, InitSatelliteArgs,
};
use junobuild_shared::types::state::{MissionControlId, UserId};
use junobuild_storage::constants::ASSET_ENCODING_NO_COMPRESSION;
use junobuild_storage::types::state::FullPath;

fn get_chunks(full_path: &FullPath) -> Result<Blob, String> {
    let asset = match get_asset(full_path) {
        Some(asset) => asset,
        None => return Err(format!("No asset found for {full_path}")),
    };

    let encoding = asset.encodings.get(ASSET_ENCODING_NO_COMPRESSION);

    match encoding {
        None => Err(format!("No identity encoding found for {full_path}")),
        Some(encoding) => {
            let content_chunks: Blob = encoding
                .content_chunks
                .iter()
                .flat_map(|chunk| chunk.iter().cloned())
                .collect();

            Ok(content_chunks)
        }
    }
}

pub fn mission_control_wasm_arg(user: &UserId) -> Result<WasmArg, String> {
    let latest_version =
        get_latest_mission_control_version().ok_or("No mission control versions available.")?;
    let full_path = format!("/releases/mission_control-v{latest_version}.wasm.gz");
    let wasm: Blob = get_chunks(&full_path)?;
    let install_arg: Vec<u8> =
        Encode!(&InitMissionControlArgs { user: *user }).map_err(|e| e.to_string())?;

    Ok(WasmArg { wasm, install_arg })
}

pub fn satellite_wasm_arg(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<WasmArg, String> {
    let latest_version =
        get_latest_satellite_version().ok_or("No satellite versions available.")?;
    let full_path = format!("/releases/satellite-v{latest_version}.wasm.gz");
    let wasm: Blob = get_chunks(&full_path)?;
    let install_arg: Vec<u8> = Encode!(&InitSatelliteArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .map_err(|e| e.to_string())?;
    Ok(WasmArg { wasm, install_arg })
}

pub fn orbiter_wasm_arg(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Result<WasmArg, String> {
    let latest_version = get_latest_orbiter_version().ok_or("No orbiter versions available.")?;
    let full_path = format!("/releases/orbiter-v{latest_version}.wasm.gz");
    let wasm: Blob = get_chunks(&full_path)?;
    let install_arg: Vec<u8> = Encode!(&InitOrbiterArgs {
        controllers: user_mission_control_controllers(user, mission_control_id)
    })
    .map_err(|e| e.to_string())?;
    Ok(WasmArg { wasm, install_arg })
}

pub fn user_mission_control_controllers(
    user: &UserId,
    mission_control_id: &MissionControlId,
) -> Vec<Principal> {
    Vec::from([*user, *mission_control_id])
}

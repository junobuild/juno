use crate::cdn::constants::RELEASES_COLLECTION_KEY;
use crate::cdn::helpers::heap::{get_asset, insert_asset};
use crate::constants::RELEASES_METADATA_JSON;
use crate::store::heap::{get_releases_metadata, set_releases_metadata};
use junobuild_cdn::proposals::SegmentsDeploymentOptions;
use junobuild_shared::ic::id;
use junobuild_storage::types::store::{Asset, AssetKey};
use junobuild_storage::utils::{create_asset_with_content, map_content_type_headers};
use serde_json::to_string;

pub fn update_releases_metadata(options: &SegmentsDeploymentOptions) -> Result<(), String> {
    let mut metadata = get_releases_metadata();

    if let Some(satellite_version) = &options.satellite_version {
        metadata.satellites.insert(satellite_version.clone());
    }

    if let Some(mission_control_version) = &options.mission_control_version {
        metadata
            .mission_controls
            .insert(mission_control_version.clone());
    }

    if let Some(orbiter_version) = &options.orbiter {
        metadata.orbiters.insert(orbiter_version.clone());
    }

    set_releases_metadata(&metadata);

    update_releases_metadata_asset()?;

    Ok(())
}

fn update_releases_metadata_asset() -> Result<(), String> {
    let metadata = get_releases_metadata();

    let json = to_string(&metadata)
        .map_err(|_| "Cannot convert releases metadata to JSON data.".to_string())?;

    let existing_asset = get_asset(&RELEASES_METADATA_JSON.to_string());

    let asset = map_releases_metadata_asset(&json, existing_asset);

    insert_asset(&RELEASES_METADATA_JSON.to_string(), &asset);

    // We do not call update_runtime_certified_asset(&asset, &config) here because this function is called during the proposal commit process, during which the certification of all assets is triggered as a post-process.

    Ok(())
}

fn map_releases_metadata_asset(metadata: &str, existing_asset: Option<Asset>) -> Asset {
    let key = AssetKey {
        name: RELEASES_METADATA_JSON.to_string(),
        full_path: RELEASES_METADATA_JSON.to_string(),
        token: None,
        collection: RELEASES_COLLECTION_KEY.to_string(),
        owner: id(),
        description: None,
    };

    let headers = map_content_type_headers("application/json");

    create_asset_with_content(metadata, &headers, existing_asset, key)
}

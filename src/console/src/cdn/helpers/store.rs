use crate::cdn::helpers::heap::get_config;
use crate::cdn::helpers::stable::get_proposal;
use crate::cdn::strategies_impls::storage::StorageState;
use crate::store::heap::get_controllers;
use candid::Principal;
use junobuild_cdn::proposals::ProposalId;
use junobuild_cdn::storage::errors::{
    JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND,
};
use junobuild_shared::regex::build_regex;
use junobuild_storage::store::create_batch;
use junobuild_storage::types::interface::InitAssetKey;
use junobuild_storage::types::runtime_state::BatchId;

pub fn init_asset_upload(
    caller: Principal,
    init: InitAssetKey,
    proposal_id: ProposalId,
) -> Result<BatchId, String> {
    let proposal = get_proposal(&proposal_id);

    if proposal.is_none() {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND, proposal_id
        ));
    }

    assert_releases_keys(&init)?;

    let controllers = get_controllers();
    let config = get_config();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageState,
    )
}

fn assert_releases_keys(InitAssetKey { full_path, .. }: &InitAssetKey) -> Result<(), String> {
    if full_path == "/releases/metadata.json" {
        return Err(format!("{} is a reserved asset.", full_path).to_string());
    }

    if full_path.starts_with("/releases/satellite")
        || full_path.starts_with("/releases/mission_control")
        || full_path.starts_with("/releases/orbiter")
    {
        let re = build_regex(
            r"^/releases/(satellite|mission_control|orbiter)-v\d+\.\d+\.\d+\.wasm\.gz$",
        )?;

        return if re.is_match(full_path) {
            Ok(())
        } else {
            Err(format!(
                "{} ({})",
                JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
            ))
        };
    }

    Ok(())
}

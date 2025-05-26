use crate::cdn::constants::CDN_JUNO_COLLECTION_KEY;
use crate::cdn::helpers::stable::get_proposal;
use crate::cdn::strategies_impls::storage::{CdnStorageAssertions, CdnStorageState};
use crate::get_controllers;
use crate::storage::store::get_config_store;
use candid::Principal;
use junobuild_cdn::proposals::{Proposal, ProposalId, ProposalType};
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
    let proposal = get_proposal(&proposal_id).ok_or_else(|| {
        format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND, proposal_id
        )
    })?;

    // TODO: hook

    // TODO: move to strategy assertion
    assert_releases_keys(&proposal, &init)?;

    let controllers = get_controllers();
    let config = get_config_store();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &CdnStorageAssertions,
        &CdnStorageState,
    )
}

fn assert_releases_keys(
    proposal: &Proposal,
    InitAssetKey {
        full_path,
        collection,
        ..
    }: &InitAssetKey,
) -> Result<(), String> {
    // match &proposal.proposal_type {
    //     ProposalType::AssetsUpgrade(ref _options) => (),
    //     ProposalType::SegmentsDeployment(_) => {
    //         let re = Regex::new(r"^/_juno/releases/satellite[^/]*\.wasm\.gz$")
    //             .map_err(|e| format!("Invalid regex: {}", e))?;
    //
    //         if !re.is_match(full_path) {
    //             return Err(format!(
    //                 "{} ({})",
    //                 JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
    //             ));
    //         }
    //     }
    // }

    // TODO: Releases only through releases - also upload asset
    if collection != CDN_JUNO_COLLECTION_KEY {
        return Ok(());
    }

    let re = build_regex(r"^/_juno/releases/satellite[^/]*\.wasm\.gz$")?;

    if !re.is_match(full_path) {
        return Err(format!(
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_INVALID_RELEASES_PATH, full_path
        ));
    }

    Ok(())
}

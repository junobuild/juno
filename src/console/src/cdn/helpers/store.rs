use crate::cdn::helpers::heap::get_config;
use crate::cdn::helpers::stable::get_proposal;
use crate::cdn::strategies_impls::storage::{StorageAssertions, StorageState};
use crate::store::heap::get_controllers;
use candid::Principal;
use junobuild_cdn::proposals::ProposalId;
use junobuild_cdn::storage::errors::JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND;
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
            "{JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND} ({proposal_id})"
        ));
    }

    let controllers = get_controllers();
    let config = get_config();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageAssertions,
        &StorageState,
    )
}

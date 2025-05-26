use crate::cdn::helpers::stable::get_proposal;
use crate::cdn::strategies_impls::storage::{CdnStorageAssertions, CdnStorageState};
use crate::get_controllers;
use crate::storage::store::get_config_store;
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
            "{} ({})",
            JUNO_CDN_STORAGE_ERROR_NO_PROPOSAL_FOUND, proposal_id
        ));
    }

    // TODO: hook

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

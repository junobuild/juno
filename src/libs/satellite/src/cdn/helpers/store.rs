use crate::cdn::helpers::stable::get_proposal;
use crate::get_controllers;
use crate::storage::store::get_config_store;
use crate::storage::strategy_impls::StorageState;
use candid::Principal;
use junobuild_cdn::proposals::ProposalId;
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
        return Err(format!("No proposal found for {}", proposal_id));
    }

    // TODO: assert full_path
    // assert_releases_keys(&init)?;

    let controllers = get_controllers();
    let config = get_config_store();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageState,
    )
}

use crate::cdn::helpers::heap::get_storage_config;
use crate::cdn::helpers::stable::get_proposal;
use crate::cdn::strategies_impls::storage::StorageState;
use crate::controllers::store::get_controllers_with_user;
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

    let controllers = get_controllers_with_user();
    let config = get_storage_config();

    create_batch(
        caller,
        &controllers,
        &config,
        init,
        Some(proposal_id),
        &StorageState,
    )
}

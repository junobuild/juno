use crate::assets::cdn::helpers::stable::get_proposal as cdn_get_proposal;
use crate::assets::cdn::helpers::store::init_asset_upload as init_asset_upload_store;
use crate::assets::cdn::strategies_impls::cdn::{CdnHeap, CdnStable, CdnWorkflow};
use crate::assets::cdn::strategies_impls::storage::{
    CdnStorageAssertions, CdnStorageState, CdnStorageUpload,
};
use crate::assets::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::assets::storage::store::{
    delete_domain_store, get_config_store, get_custom_domains_store, set_domain_store,
};
use crate::types::interface::DeleteProposalAssets;
use crate::{caller, get_controllers};
use ic_cdk::trap;
use junobuild_cdn::proposals::{
    CommitProposal, ListProposalResults, ListProposalsParams, Proposal, ProposalId, ProposalType,
    RejectProposal,
};
use junobuild_shared::ic::call::ManualReply;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_chunk};
use junobuild_storage::types::interface::{
    CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};
use junobuild_storage::types::state::FullPath;

// ---------------------------------------------------------
// Proposal
// ---------------------------------------------------------

pub fn get_proposal(proposal_id: &ProposalId) -> Option<Proposal> {
    cdn_get_proposal(proposal_id)
}

pub fn list_proposals(filter: &ListProposalsParams) -> ListProposalResults {
    junobuild_cdn::proposals::list_proposals(&CdnStable, filter)
}

pub fn count_proposals() -> usize {
    junobuild_cdn::proposals::count_proposals(&CdnStable)
}

pub fn init_proposal(proposal_type: &ProposalType) -> (ProposalId, Proposal) {
    let caller = caller();

    junobuild_cdn::proposals::init_proposal(&CdnStable, caller, proposal_type)
        .unwrap_or_else(|e| trap(&e))
}

pub fn submit_proposal(proposal_id: &ProposalId) -> (ProposalId, Proposal) {
    let caller = caller();

    junobuild_cdn::proposals::submit_proposal(&CdnStable, caller, proposal_id)
        .unwrap_or_else(|e| trap(&e))
}

pub fn reject_proposal(proposal: &RejectProposal) -> ManualReply<()> {
    match junobuild_cdn::proposals::reject_proposal(&CdnStable, proposal) {
        Ok(_) => ManualReply::one(()),
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

pub fn commit_proposal(proposal: &CommitProposal) -> ManualReply<()> {
    match junobuild_cdn::proposals::commit_proposal(&CdnHeap, &CdnStable, &CdnWorkflow, proposal) {
        Ok(_) => {
            defer_init_certified_assets();
            ManualReply::one(())
        }
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

pub fn delete_proposal_assets(DeleteProposalAssets { proposal_ids }: &DeleteProposalAssets) {
    junobuild_cdn::proposals::delete_proposal_assets(&CdnStable, proposal_ids)
        .unwrap_or_else(|e| trap(&e));
}

// ---------------------------------------------------------
// Internal storage
// ---------------------------------------------------------

pub fn init_proposal_asset_upload(init: InitAssetKey, proposal_id: ProposalId) -> InitUploadResult {
    let caller = caller();

    let result = init_asset_upload_store(caller, init, proposal_id);

    match result {
        Ok(batch_id) => InitUploadResult { batch_id },
        Err(error) => trap(&error),
    }
}

pub fn init_proposal_many_assets_upload(
    init_asset_keys: Vec<InitAssetKey>,
    proposal_id: ProposalId,
) -> Vec<(FullPath, InitUploadResult)> {
    let caller = caller();

    let mut results: Vec<(FullPath, InitUploadResult)> = Vec::new();

    for init_asset_key in init_asset_keys {
        let full_path = init_asset_key.full_path.clone();

        let batch_id = init_asset_upload_store(caller, init_asset_key, proposal_id)
            .unwrap_or_else(|e| trap(&e));

        results.push((full_path, InitUploadResult { batch_id }));
    }

    results
}

pub fn upload_proposal_asset_chunk(chunk: UploadChunk) -> UploadChunkResult {
    let caller = caller();
    let config = get_config_store();

    let result = create_chunk(caller, &config, chunk);

    match result {
        Ok(chunk_id) => UploadChunkResult { chunk_id },
        Err(error) => trap(&error),
    }
}

pub fn commit_proposal_asset_upload(commit: CommitBatch) {
    let caller = caller();

    let controllers: Controllers = get_controllers();
    let config = get_config_store();

    commit_batch_storage(
        caller,
        &controllers,
        &config,
        commit,
        &CdnStorageAssertions,
        &CdnStorageState,
        &CdnStorageUpload,
    )
    .unwrap_or_else(|e| trap(&e));
}

pub fn commit_proposal_many_assets_upload(commits: Vec<CommitBatch>) {
    let caller = caller();

    let controllers: Controllers = get_controllers();
    let config = get_config_store();

    for commit in commits {
        commit_batch_storage(
            caller,
            &controllers,
            &config,
            commit,
            &CdnStorageAssertions,
            &CdnStorageState,
            &CdnStorageUpload,
        )
        .unwrap_or_else(|e| trap(&e));
    }
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn list_custom_domains() -> CustomDomains {
    get_custom_domains_store()
}

pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    set_domain_store(&domain_name, &bn_id).unwrap_or_else(|e| trap(&e));
}

pub fn del_custom_domain(domain_name: DomainName) {
    delete_domain_store(&domain_name).unwrap_or_else(|e| trap(&e));
}

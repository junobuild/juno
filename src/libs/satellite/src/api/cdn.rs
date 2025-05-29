use crate::cdn::helpers::stable::get_proposal as cdn_get_proposal;
use crate::cdn::helpers::store::init_asset_upload as init_asset_upload_store;
use crate::cdn::strategies_impls::cdn::{CdnHeap, CdnStable, CdnWorkflow};
use crate::cdn::strategies_impls::storage::{
    CdnStorageAssertions, CdnStorageState, CdnStorageUpload,
};
use crate::get_controllers;
use crate::storage::certified_assets::upgrade::defer_init_certified_assets;
use crate::storage::store::{
    delete_domain_store, get_config_store, get_custom_domains_store, set_domain_store,
};
use crate::types::interface::DeleteProposalAssets;
use ic_cdk::api::call::ManualReply;
use ic_cdk::{caller, trap};
use junobuild_cdn::proposals::{
    CommitProposal, ListProposalResults, ListProposalsParams, Proposal, ProposalId, ProposalType,
};
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_shared::types::state::Controllers;
use junobuild_storage::store::{commit_batch as commit_batch_storage, create_chunk};
use junobuild_storage::types::interface::{
    CommitBatch, InitAssetKey, InitUploadResult, UploadChunk, UploadChunkResult,
};

// ---------------------------------------------------------
// Proposal
// ---------------------------------------------------------

pub fn get_proposal(proposal_id: &ProposalId) -> Option<Proposal> {
    cdn_get_proposal(proposal_id)
}

pub fn list_proposals(filter: &ListProposalsParams) -> ListProposalResults {
    junobuild_cdn::proposals::stable::list_proposals(&CdnStable, filter)
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

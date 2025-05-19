use crate::cdn::certified_assets::upgrade::defer_init_certified_assets;
use crate::cdn::strategies_impls::cdn::{CdnHeap, CdnStable, CdnWorkflow};
use crate::cdn::strategies_impls::storage::StorageState;
use crate::guards::caller_is_user_or_admin_controller;
use crate::types::interface::DeleteProposalAssets;
use ic_cdk::api::call::ManualReply;
use ic_cdk::{caller, trap};
use ic_cdk_macros::{query, update};
use junobuild_cdn::proposals::{CommitProposal, Proposal, ProposalId, ProposalType};
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
// ---------------------------------------------------------
// Proposal
// ---------------------------------------------------------

// TODO: caller_is_user_or_admin_controller only
#[query]
fn get_proposal(proposal_id: ProposalId) -> Option<Proposal> {
    junobuild_cdn::proposals::stable::get_proposal(&CdnStable, &proposal_id)
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn init_proposal(proposal_type: ProposalType) -> (ProposalId, Proposal) {
    let caller = caller();

    junobuild_cdn::proposals::init_proposal(&CdnStable, caller, &proposal_type)
        .unwrap_or_else(|e| trap(&e))
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn submit_proposal(proposal_id: ProposalId) -> (ProposalId, Proposal) {
    let caller = caller();

    junobuild_cdn::proposals::submit_proposal(&CdnStable, caller, &proposal_id)
        .unwrap_or_else(|e| trap(&e))
}

// TODO: ADMIN controller only
#[update(guard = "caller_is_user_or_admin_controller", manual_reply = true)]
fn commit_proposal(proposal: CommitProposal) -> ManualReply<()> {
    match junobuild_cdn::proposals::commit_proposal(&CdnHeap, &CdnStable, &CdnWorkflow, &proposal) {
        Ok(_) => {
            defer_init_certified_assets();
            ManualReply::one(())
        }
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

// TODO: ADMIN controller can delete proposal's assets of any proposals - not limited to proposal.owner === caller
#[update(guard = "caller_is_user_or_admin_controller")]
fn delete_proposal_assets(DeleteProposalAssets { proposal_ids }: DeleteProposalAssets) {
    let caller = caller();

    junobuild_cdn::proposals::delete_proposal_assets(&CdnStable, caller, &proposal_ids)
        .unwrap_or_else(|e| trap(&e));
}

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    junobuild_cdn::storage::set_config_store(&CdnHeap, &StorageState, &config);
}

#[query(guard = "caller_is_user_or_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

#[query(guard = "caller_is_user_or_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    junobuild_cdn::storage::heap::get_domains(&CdnHeap)
}

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    junobuild_cdn::storage::set_domain_store(&CdnHeap, &StorageState, &domain_name, &bn_id)
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    junobuild_cdn::storage::delete_domain_store(&CdnHeap, &StorageState, &domain_name)
        .unwrap_or_else(|e| trap(&e));
}

use crate::cdn::certified_assets::upgrade::defer_init_certified_assets;
use crate::cdn::helpers::stable::get_proposal as get_proposal_state;
use crate::cdn::proposals::{
    commit_proposal as make_commit_proposal, count_proposals as count_proposals_state,
    delete_proposal_assets as delete_proposal_assets_proposal, init_proposal as make_init_proposal,
    list_proposals as list_proposals_state, reject_proposal as make_reject_proposal,
    submit_proposal as make_submit_proposal,
};
use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::cdn::strategies_impls::storage::StorageState;
use crate::guards::caller_is_admin_controller;
use crate::types::interface::DeleteProposalAssets;
use ic_cdk_macros::{query, update};
use junobuild_cdn::proposals::{
    CommitProposal, ListProposalResults, ListProposalsParams, Proposal, ProposalId, ProposalType,
    RejectProposal,
};
use junobuild_shared::ic::api::caller;
use junobuild_shared::ic::call::ManualReply;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;

// ---------------------------------------------------------
// Proposal
// ---------------------------------------------------------

#[query]
fn get_proposal(proposal_id: ProposalId) -> Option<Proposal> {
    get_proposal_state(&proposal_id)
}

#[query]
fn list_proposals(filter: ListProposalsParams) -> ListProposalResults {
    list_proposals_state(&filter)
}

#[query]
fn count_proposals() -> usize {
    count_proposals_state()
}

#[update(guard = "caller_is_admin_controller")]
fn init_proposal(proposal_type: ProposalType) -> (ProposalId, Proposal) {
    let caller = caller();

    make_init_proposal(caller, &proposal_type).unwrap_or_trap()
}

#[update(guard = "caller_is_admin_controller")]
fn submit_proposal(proposal_id: ProposalId) -> (ProposalId, Proposal) {
    let caller = caller();

    make_submit_proposal(caller, &proposal_id).unwrap_or_trap()
}

#[update(guard = "caller_is_admin_controller", manual_reply = true)]
fn reject_proposal(proposal: RejectProposal) -> ManualReply<()> {
    match make_reject_proposal(&proposal) {
        Ok(_) => ManualReply::one(()),
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

#[update(guard = "caller_is_admin_controller", manual_reply = true)]
fn commit_proposal(proposal: CommitProposal) -> ManualReply<()> {
    match make_commit_proposal(&proposal) {
        Ok(_) => {
            defer_init_certified_assets();
            ManualReply::one(())
        }
        Err(e) => ManualReply::reject(e.to_string()),
    }
}

#[update(guard = "caller_is_admin_controller")]
fn delete_proposal_assets(DeleteProposalAssets { proposal_ids }: DeleteProposalAssets) {
    delete_proposal_assets_proposal(&proposal_ids).unwrap_or_trap();
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

#[query(guard = "caller_is_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    junobuild_cdn::storage::heap::get_domains(&CdnHeap)
}

#[update(guard = "caller_is_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    junobuild_cdn::storage::set_domain_store(&CdnHeap, &StorageState, &domain_name, &bn_id)
        .unwrap_or_trap();
}

#[update(guard = "caller_is_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    junobuild_cdn::storage::delete_domain_store(&CdnHeap, &StorageState, &domain_name)
        .unwrap_or_trap();
}

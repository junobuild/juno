use crate::cdn::strategies_impls::cdn::{CdnHeap, CdnStable, CdnWorkflow};
use crate::metadata::update_releases_metadata;
use candid::Principal;
use junobuild_cdn::proposals::{
    CommitProposal, CommitProposalError, ListProposalResults, ListProposalsParams,
};
use junobuild_cdn::proposals::{Proposal, ProposalId, ProposalType};

pub fn list_proposals(filter: &ListProposalsParams) -> ListProposalResults {
    junobuild_cdn::proposals::stable::list_proposals(&CdnStable, filter)
}

pub fn count_proposals() -> usize {
    junobuild_cdn::proposals::stable::count_proposals(&CdnStable)
}

pub fn init_proposal(
    caller: Principal,
    proposal_type: &ProposalType,
) -> Result<(ProposalId, Proposal), String> {
    junobuild_cdn::proposals::init_proposal(&CdnStable, caller, proposal_type)
}

pub fn submit_proposal(
    caller: Principal,
    proposal_id: &ProposalId,
) -> Result<(ProposalId, Proposal), String> {
    junobuild_cdn::proposals::submit_proposal(&CdnStable, caller, proposal_id)
}

pub fn commit_proposal(proposition: &CommitProposal) -> Result<(), CommitProposalError> {
    junobuild_cdn::proposals::commit_proposal(&CdnHeap, &CdnStable, &CdnWorkflow, proposition)
}

pub fn delete_proposal_assets(proposal_ids: &Vec<ProposalId>) -> Result<(), String> {
    junobuild_cdn::proposals::delete_proposal_assets(&CdnStable, proposal_ids)
}

pub fn post_commit_assets(proposal: &Proposal) -> Result<(), String> {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(_) => (),
        ProposalType::SegmentsDeployment(ref options) => {
            return update_releases_metadata(options);
        }
    }

    Ok(())
}

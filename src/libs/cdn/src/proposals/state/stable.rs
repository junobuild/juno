use crate::proposals::state::filter::filter_proposals_range;
use crate::proposals::{
    ListProposalsParams, Proposal, ProposalId, ProposalKey, ProposalList, ProposalsStable,
};
use crate::strategies::CdnStableStrategy;

pub fn get_proposal(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
) -> Option<Proposal> {
    cdn_stable.with_proposals(|proposals| get_proposal_impl(proposal_id, proposals))
}

fn get_proposal_impl(proposal_id: &ProposalId, proposals: &ProposalsStable) -> Option<Proposal> {
    proposals.get(&proposal_key(proposal_id))
}

pub fn list_proposals(
    cdn_stable: &impl CdnStableStrategy,
    filters: &ListProposalsParams,
) -> ProposalList {
    cdn_stable.with_proposals(|proposals| list_proposals_impl(filters, proposals))
}

fn list_proposals_impl(filters: &ListProposalsParams, proposals: &ProposalsStable) -> ProposalList {
    proposals.range(filter_proposals_range(filters)).collect()
}

pub fn count_proposals(cdn_stable: &impl CdnStableStrategy) -> usize {
    cdn_stable.with_proposals(count_proposals_impl)
}

fn count_proposals_impl(proposals: &ProposalsStable) -> usize {
    proposals.iter().count()
}

pub fn insert_proposal(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    proposal: &Proposal,
) {
    cdn_stable
        .with_proposals_mut(|proposals| insert_proposal_impl(proposal_id, proposal, proposals))
}

fn insert_proposal_impl(
    proposal_id: &ProposalId,
    proposal: &Proposal,
    proposals: &mut ProposalsStable,
) {
    proposals.insert(proposal_key(proposal_id), proposal.clone());
}

fn proposal_key(proposal_id: &ProposalId) -> ProposalKey {
    ProposalKey {
        proposal_id: *proposal_id,
    }
}

use crate::proposals::state::filter::filter_proposals_range;
use crate::proposals::{ListProposalResults, Proposal, ProposalId, ProposalKey, ProposalsStable};
use crate::strategies::CdnStableStrategy;
use junobuild_shared::structures::collect_stable_vec;

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
    filters_key: &(u128, u128),
) -> ListProposalResults {
    cdn_stable.with_proposals(|proposals| list_proposals_impl(filters_key, proposals))
}

fn list_proposals_impl(
    filters_key: &(u128, u128),
    proposals: &ProposalsStable,
) -> ListProposalResults {
    let items: Vec<(ProposalKey, Proposal)> =
        collect_stable_vec(proposals.range(filter_proposals_range(filters_key)));

    let items_length = items.len();

    ListProposalResults {
        items,
        items_length,
        matches_length: items_length,
    }
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

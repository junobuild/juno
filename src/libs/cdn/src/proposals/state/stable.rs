use crate::proposals::{Proposal, ProposalId, ProposalKey, ProposalsStable};
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

fn proposal_key(proposal_id: &ProposalId) -> ProposalKey {
    ProposalKey {
        proposal_id: *proposal_id,
    }
}

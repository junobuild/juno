use crate::cdn::strategy_impls::CdnStable;
use junobuild_cdn::proposals::{Proposal, ProposalId};

// ---------------------------------------------------------
// Proposals
// ---------------------------------------------------------

pub fn get_proposal(proposal_id: &ProposalId) -> Option<Proposal> {
    junobuild_cdn::proposals::stable::get_proposal(&CdnStable, proposal_id)
}

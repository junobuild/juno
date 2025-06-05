use crate::assets::cdn::strategies_impls::cdn::CdnStable;
use junobuild_cdn::proposals::{Proposal, ProposalId};

// ---------------------------------------------------------
// Proposals
// ---------------------------------------------------------

pub fn get_proposal(proposal_id: &ProposalId) -> Option<Proposal> {
    junobuild_cdn::proposals::get_proposal(&CdnStable, proposal_id)
}

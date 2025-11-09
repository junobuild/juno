use crate::proposals::errors::JUNO_CDN_PROPOSALS_ERROR_UNKNOWN_TYPE;
use crate::proposals::{Proposal, ProposalType};

pub fn assert_known_proposal_type(proposal: &Proposal) -> Result<(), String> {
    #[allow(unreachable_patterns)]
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(_) => (),
        ProposalType::SegmentsDeployment(_) => (),
        _ => return Err(JUNO_CDN_PROPOSALS_ERROR_UNKNOWN_TYPE.to_string()),
    };

    Ok(())
}

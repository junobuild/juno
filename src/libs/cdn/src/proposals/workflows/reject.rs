use crate::proposals::errors::{
    JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT, JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS,
    JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH,
};
use crate::proposals::workflows::assert::assert_known_proposal_type;
use crate::proposals::{get_proposal, insert_proposal};
use crate::proposals::{Proposal, ProposalStatus, RejectProposal, RejectProposalError};
use crate::strategies::CdnStableStrategy;
use hex::encode;

pub fn reject_proposal(
    cdn_stable: &impl CdnStableStrategy,
    proposition: &RejectProposal,
) -> Result<(), RejectProposalError> {
    let proposal = get_proposal(cdn_stable, &proposition.proposal_id).ok_or_else(|| {
        RejectProposalError::ProposalNotFound(format!(
            "{} ({})",
            JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT, proposition.proposal_id
        ))
    })?;

    secure_reject_proposal(cdn_stable, proposition, &proposal)
}

fn secure_reject_proposal(
    cdn_stable: &impl CdnStableStrategy,
    reject_proposal: &RejectProposal,
    proposal: &Proposal,
) -> Result<(), RejectProposalError> {
    if proposal.status != ProposalStatus::Open {
        return Err(RejectProposalError::ProposalNotOpen(format!(
            "{} ({:?})",
            JUNO_CDN_PROPOSALS_ERROR_CANNOT_REJECT_INVALID_STATUS, proposal.status
        )));
    }

    match &proposal.sha256 {
        Some(sha256) if sha256 == &reject_proposal.sha256 => (),
        _ => {
            return Err(RejectProposalError::InvalidSha256(format!(
                "{} ({})",
                JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH,
                encode(reject_proposal.sha256)
            )));
        }
    }

    assert_known_proposal_type(proposal).map_err(RejectProposalError::InvalidType)?;

    let rejected_proposal = Proposal::reject(proposal);
    insert_proposal(cdn_stable, &reject_proposal.proposal_id, &rejected_proposal);

    Ok(())
}

use crate::proposals::errors::{
    JUNO_CDN_PROPOSALS_ERROR_NEXT_ID_CONVERT, JUNO_CDN_PROPOSALS_ERROR_NEXT_ID_OVERFLOW,
};
use crate::proposals::stable::{count_proposals, insert_proposal};
use crate::proposals::{Proposal, ProposalId, ProposalType};
use crate::strategies::CdnStableStrategy;
use candid::Principal;

pub fn init_proposal(
    cdn_stable: &impl CdnStableStrategy,
    caller: Principal,
    proposal_type: &ProposalType,
) -> Result<(ProposalId, Proposal), String> {
    let proposal_id = u128::try_from(count_proposals(cdn_stable))
        .map_err(|_| JUNO_CDN_PROPOSALS_ERROR_NEXT_ID_CONVERT.to_string())?
        .checked_add(1)
        .ok_or(JUNO_CDN_PROPOSALS_ERROR_NEXT_ID_OVERFLOW.to_string())?;

    let proposal: Proposal = Proposal::init(caller, proposal_type);

    insert_proposal(cdn_stable, &proposal_id, &proposal);

    Ok((proposal_id, proposal))
}

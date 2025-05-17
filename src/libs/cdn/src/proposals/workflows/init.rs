use crate::proposals::stable::{count_proposals, insert_proposal};
use crate::proposals::{Proposal, ProposalId, ProposalType};
use crate::strategies::CdnStableStrategy;
use candid::Principal;

pub fn init_proposal(
    cdn_stable: &impl CdnStableStrategy,
    caller: Principal,
    proposal_type: &ProposalType,
) -> Result<(ProposalId, Proposal), String> {
    let proposal_id = u128::try_from(count_proposals(cdn_stable) + 1)
        .map_err(|_| "Cannot convert next proposal ID.")?;

    let proposal: Proposal = Proposal::init(caller, proposal_type);

    insert_proposal(cdn_stable, &proposal_id, &proposal);

    Ok((proposal_id, proposal))
}

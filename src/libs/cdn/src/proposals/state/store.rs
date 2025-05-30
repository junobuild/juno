use crate::proposals::state::stable::list_proposals as list_proposals_stable;
use crate::proposals::{count_proposals, ListProposalResults, ListProposalsParams};
use crate::strategies::CdnStableStrategy;

const FIRST_PROPOSAL_ID: u128 = 1;

const DEFAULT_MAX_PROPOSALS: u128 = 100;

pub fn list_proposals(
    cdn_stable: &impl CdnStableStrategy,
    ListProposalsParams { paginate, order }: &ListProposalsParams,
) -> ListProposalResults {
    let desc = order.as_ref().map(|order| order.desc).unwrap_or(false);
    let limit = paginate
        .as_ref()
        .and_then(|p| p.limit)
        .unwrap_or(DEFAULT_MAX_PROPOSALS);

    let filters = match (paginate, desc) {
        (None, false) => {
            let start = FIRST_PROPOSAL_ID;
            let end = start.saturating_add(DEFAULT_MAX_PROPOSALS);
            (start, end)
        }

        (None, true) => {
            let end = u128::try_from(count_proposals(cdn_stable)).unwrap_or(u128::MAX);
            let start = end.saturating_sub(DEFAULT_MAX_PROPOSALS.saturating_sub(1));
            (start, end)
        }

        (Some(paginate), false) => {
            let start = paginate
                .start_after
                .as_ref()
                .map(|proposal_id| proposal_id.saturating_add(1))
                .unwrap_or(FIRST_PROPOSAL_ID);
            let end = start.saturating_add(limit);
            (start, end)
        }

        (Some(paginate), true) => {
            let end = paginate.start_after.unwrap_or(u128::MAX);
            let start = end.saturating_sub(limit.saturating_sub(1));
            (start, end)
        }
    };

    let mut proposals = list_proposals_stable(cdn_stable, &filters);

    if desc {
        proposals
            .items
            .sort_by(|a, b| b.0.proposal_id.cmp(&a.0.proposal_id));
    }

    proposals
}

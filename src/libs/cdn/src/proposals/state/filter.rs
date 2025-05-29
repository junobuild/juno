use crate::proposals::{ListProposalsParams, ProposalKey};
use std::ops::RangeBounds;

pub fn filter_proposals_range(
    ListProposalsParams { paginate }: &ListProposalsParams,
) -> impl RangeBounds<ProposalKey> {
    let start_key = ProposalKey {
        proposal_id: match paginate {
            Some(paginate) => paginate
                .start_after
                .as_ref()
                .map(|proposal_id| proposal_id.saturating_add(1))
                .unwrap_or(u128::MIN),
            None => u128::MIN,
        },
    };

    let end_key = ProposalKey {
        proposal_id: match paginate {
            Some(paginate) => paginate
                .limit
                .as_ref()
                .map(|limit| start_key.proposal_id.saturating_add(*limit))
                .unwrap_or(u128::MAX),
            None => u128::MAX,
        },
    };

    start_key..end_key
}

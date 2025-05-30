use crate::proposals::ProposalKey;
use std::ops::RangeBounds;

pub fn filter_proposals_range(
    (start_proposal_id, end_proposal_id): &(u128, u128),
) -> impl RangeBounds<ProposalKey> {
    let start_key = ProposalKey {
        proposal_id: start_proposal_id.clone(),
    };

    let end_key = ProposalKey {
        proposal_id: end_proposal_id.clone(),
    };

    start_key..end_key
}

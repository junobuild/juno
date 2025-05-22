use crate::proposals::errors::{
    JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS,
    JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS_INVALID_STATUS,
};
use crate::proposals::stable::get_proposal;
use crate::proposals::workflows::assert::assert_known_proposal_type;
use crate::proposals::{Proposal, ProposalId, ProposalStatus};
use crate::storage::stable::{delete_asset, delete_content_chunks, get_assets};
use crate::strategies::CdnStableStrategy;

pub fn delete_proposal_assets(
    cdn_stable: &impl CdnStableStrategy,
    proposal_ids: &Vec<ProposalId>,
) -> Result<(), String> {
    for proposal_id in proposal_ids {
        let proposal = get_proposal(cdn_stable, proposal_id);

        match proposal {
            None => {
                return Err(JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS.to_string());
            }
            Some(proposal) => secure_delete_proposal_assets(cdn_stable, proposal_id, &proposal)?,
        }
    }

    Ok(())
}

pub fn secure_delete_proposal_assets(
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
    proposal: &Proposal,
) -> Result<(), String> {
    if proposal.status == ProposalStatus::Open {
        return Err(format!(
            "{} ({:?})",
            JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS_INVALID_STATUS, proposal.status
        ));
    }

    assert_known_proposal_type(proposal)?;

    let assets = get_assets(cdn_stable, proposal_id);

    for (key, asset) in assets {
        for (_, encoding) in asset.encodings.iter() {
            delete_content_chunks(cdn_stable, &encoding.content_chunks);
        }

        delete_asset(cdn_stable, &key);
    }

    Ok(())
}

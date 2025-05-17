use crate::metadata::update_releases_metadata;
use crate::storage::state::stable::{
    delete_asset_stable, delete_content_chunks_stable, get_assets_stable,
};
use crate::store::stable::get_proposal;
use crate::strategies_impls::cdn::{CdnHeap, CdnStable, CdnWorkflow};
use candid::Principal;
use junobuild_cdn::proposals::errors::{
    JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS,
    JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS_INVALID_STATUS, JUNO_ERROR_PROPOSALS_UNKNOWN_TYPE,
};
use junobuild_cdn::proposals::{CommitProposal, CommitProposalError};
use junobuild_cdn::proposals::{Proposal, ProposalId, ProposalStatus, ProposalType};
use junobuild_shared::utils::principal_not_equal;

pub fn init_proposal(
    caller: Principal,
    proposal_type: &ProposalType,
) -> Result<(ProposalId, Proposal), String> {
    junobuild_cdn::proposals::init_proposal(&CdnStable, caller, proposal_type)
}

pub fn submit_proposal(
    caller: Principal,
    proposal_id: &ProposalId,
) -> Result<(ProposalId, Proposal), String> {
    junobuild_cdn::proposals::submit_proposal(&CdnStable, caller, proposal_id)
}

pub fn commit_proposal(proposition: &CommitProposal) -> Result<(), CommitProposalError> {
    junobuild_cdn::proposals::commit_proposal(&CdnHeap, &CdnStable, &CdnWorkflow, proposition)
}

pub fn delete_proposal_assets(
    caller: Principal,
    proposal_ids: &Vec<ProposalId>,
) -> Result<(), String> {
    for proposal_id in proposal_ids {
        let proposal = get_proposal(proposal_id);

        match proposal {
            None => {
                return Err(JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS.to_string());
            }
            Some(proposal) => secure_delete_proposal_assets(caller, proposal_id, &proposal)?,
        }
    }

    Ok(())
}

pub fn post_commit_assets(proposal: &Proposal) -> Result<(), String> {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(_) => (),
        ProposalType::SegmentsDeployment(ref options) => {
            return update_releases_metadata(options);
        }
    }

    Ok(())
}

pub fn secure_delete_proposal_assets(
    caller: Principal,
    proposal_id: &ProposalId,
    proposal: &Proposal,
) -> Result<(), String> {
    // The one that uploaded the assets can remove those.
    if principal_not_equal(caller, proposal.owner) {
        return Err(JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS.to_string());
    }

    if proposal.status == ProposalStatus::Open {
        return Err(format!(
            "{} ({:?})",
            JUNO_ERROR_PROPOSALS_CANNOT_DELETE_ASSETS_INVALID_STATUS, proposal.status
        ));
    }

    assert_known_proposal_type(proposal)?;

    let assets = get_assets_stable(proposal_id);

    for (key, asset) in assets {
        for (_, encoding) in asset.encodings.iter() {
            delete_content_chunks_stable(&encoding.content_chunks);
        }

        delete_asset_stable(&key);
    }

    Ok(())
}

fn assert_known_proposal_type(proposal: &Proposal) -> Result<(), String> {
    #[allow(unreachable_patterns)]
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(_) => (),
        ProposalType::SegmentsDeployment(_) => (),
        _ => return Err(JUNO_ERROR_PROPOSALS_UNKNOWN_TYPE.to_string()),
    };

    Ok(())
}

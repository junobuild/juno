use crate::proposals::errors::{
    JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT, JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT_INVALID_STATUS,
};
use crate::proposals::stable::{get_proposal, insert_proposal};
use crate::proposals::workflows::assert::assert_known_proposal_type;
use crate::proposals::{Proposal, ProposalId, ProposalStatus};
use crate::storage::stable::get_assets;
use crate::strategies::CdnStableStrategy;
use candid::Principal;
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_shared::utils::principal_not_equal;
use sha2::{Digest, Sha256};

pub fn submit_proposal(
    cdn_stable: &impl CdnStableStrategy,
    caller: Principal,
    proposal_id: &ProposalId,
) -> Result<(ProposalId, Proposal), String> {
    let proposal = get_proposal(cdn_stable, proposal_id);

    match proposal {
        None => Err(JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT.to_string()),
        Some(proposal) => secure_submit_proposal(cdn_stable, caller, proposal_id, &proposal),
    }
}

fn secure_submit_proposal(
    cdn_stable: &impl CdnStableStrategy,
    caller: Principal,
    proposal_id: &ProposalId,
    proposal: &Proposal,
) -> Result<(ProposalId, Proposal), String> {
    // The one that started the upload should be the one that propose it.
    if principal_not_equal(caller, proposal.owner) {
        return Err(JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT.to_string());
    }

    if proposal.status != ProposalStatus::Initialized {
        return Err(format!(
            "{} ({:?})",
            JUNO_CDN_PROPOSALS_ERROR_CANNOT_SUBMIT_INVALID_STATUS, proposal.status
        ));
    }

    assert_known_proposal_type(proposal)?;

    let assets = get_assets(cdn_stable, proposal_id);

    let mut hasher = Sha256::new();

    for (key, asset) in assets {
        hasher.update(key.hash());
        hasher.update(asset.hash());

        for (_, encoding) in asset.encodings {
            hasher.update(encoding.hash());
        }
    }

    let hash: Hash = hasher.finalize().into();

    let proposal: Proposal = Proposal::open(proposal, hash);

    insert_proposal(cdn_stable, proposal_id, &proposal);

    Ok((*proposal_id, proposal))
}

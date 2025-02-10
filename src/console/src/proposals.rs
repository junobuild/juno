use crate::metadata::update_releases_metadata;
use crate::msg::{
    ERROR_CANNOT_COMMIT_PROPOSAL, ERROR_CANNOT_DELETE_PROPOSAL_ASSETS,
    ERROR_CANNOT_SUBMIT_PROPOSAL, ERROR_PROPOSAL_TYPE_NOT_SUPPORTED,
};
use crate::storage::state::heap::insert_asset;
use crate::storage::state::stable::{
    delete_asset_stable, delete_content_chunks_stable, get_assets_stable, get_content_chunks_stable,
};
use crate::storage::store::{delete_assets, insert_asset_encoding};
use crate::store::stable::{count_proposals, get_proposal, insert_proposal};
use crate::types::core::CommitProposalError;
use crate::types::interface::CommitProposal;
use crate::types::state::{Proposal, ProposalId, ProposalStatus, ProposalType};
use candid::Principal;
use hex::encode;
use junobuild_collections::constants::COLLECTION_ASSET_KEY;
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_shared::utils::principal_not_equal;
use junobuild_storage::types::store::AssetEncoding;
use sha2::{Digest, Sha256};

pub fn init_proposal(
    caller: Principal,
    proposal_type: &ProposalType,
) -> Result<(ProposalId, Proposal), String> {
    let proposal_id =
        u128::try_from(count_proposals() + 1).map_err(|_| "Cannot convert next proposal ID.")?;

    let proposal: Proposal = Proposal::init(caller, proposal_type);

    insert_proposal(&proposal_id, &proposal);

    Ok((proposal_id, proposal))
}

pub fn submit_proposal(
    caller: Principal,
    proposal_id: &ProposalId,
) -> Result<(ProposalId, Proposal), String> {
    let proposal = get_proposal(proposal_id);

    match proposal {
        None => Err(ERROR_CANNOT_SUBMIT_PROPOSAL.to_string()),
        Some(proposal) => secure_submit_proposal(caller, proposal_id, &proposal),
    }
}

pub fn commit_proposal(proposition: &CommitProposal) -> Result<(), CommitProposalError> {
    let proposal = get_proposal(&proposition.proposal_id).ok_or_else(|| {
        CommitProposalError::ProposalNotFound(format!(
            "{} {}",
            ERROR_CANNOT_COMMIT_PROPOSAL, proposition.proposal_id
        ))
    })?;

    match secure_commit_proposal(proposition, &proposal) {
        Ok(_) => {
            let executed_proposal = Proposal::execute(&proposal);
            insert_proposal(&proposition.proposal_id, &executed_proposal);
            Ok(())
        }
        Err(e @ CommitProposalError::CommitAssetsIssue(_))
        | Err(e @ CommitProposalError::PostCommitAssetsIssue(_)) => {
            let failed_proposal = Proposal::fail(&proposal);
            insert_proposal(&proposition.proposal_id, &failed_proposal);
            Err(e)
        }
        Err(e) => Err(e),
    }
}

pub fn delete_proposal_assets(
    caller: Principal,
    proposal_ids: &Vec<ProposalId>,
) -> Result<(), String> {
    for proposal_id in proposal_ids {
        let proposal = get_proposal(proposal_id);

        match proposal {
            None => {
                return Err(ERROR_CANNOT_DELETE_PROPOSAL_ASSETS.to_string());
            }
            Some(proposal) => secure_delete_proposal_assets(caller, proposal_id, &proposal)?,
        }
    }

    Ok(())
}

fn secure_submit_proposal(
    caller: Principal,
    proposal_id: &ProposalId,
    proposal: &Proposal,
) -> Result<(ProposalId, Proposal), String> {
    // The one that started the upload should be the one that propose it.
    if principal_not_equal(caller, proposal.owner) {
        return Err(ERROR_CANNOT_SUBMIT_PROPOSAL.to_string());
    }

    if proposal.status != ProposalStatus::Initialized {
        return Err(format!(
            "Proposal cannot be submitted. Current status: {:?}",
            proposal.status
        ));
    }

    assert_known_proposal_type(proposal)?;

    let assets = get_assets_stable(proposal_id);

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

    insert_proposal(proposal_id, &proposal);

    Ok((*proposal_id, proposal))
}

fn secure_commit_proposal(
    commit_proposal: &CommitProposal,
    proposal: &Proposal,
) -> Result<(), CommitProposalError> {
    if proposal.status != ProposalStatus::Open {
        return Err(CommitProposalError::ProposalNotOpen(format!(
            "Proposal cannot be committed. Current status: {:?}",
            proposal.status
        )));
    }

    match &proposal.sha256 {
        Some(sha256) if sha256 == &commit_proposal.sha256 => (),
        _ => {
            return Err(CommitProposalError::InvalidSha256(format!("The provided SHA-256 hash ({}) does not match the expected value for the proposal to commit.", encode(commit_proposal.sha256))));
        }
    }

    assert_known_proposal_type(proposal).map_err(CommitProposalError::InvalidType)?;

    // Mark proposal as accepted.
    let accepted_proposal = Proposal::accept(proposal);
    insert_proposal(&commit_proposal.proposal_id, &accepted_proposal);

    pre_commit_assets(proposal);

    copy_committed_assets(&commit_proposal.proposal_id)
        .map_err(CommitProposalError::CommitAssetsIssue)?;

    post_commit_assets(proposal).map_err(CommitProposalError::PostCommitAssetsIssue)?;

    Ok(())
}

fn pre_commit_assets(proposal: &Proposal) {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(ref options) => {
            // Clear existing assets if required.
            if let Some(true) = options.clear_existing_assets {
                delete_assets(&COLLECTION_ASSET_KEY.to_string());
            }
        }
        ProposalType::SegmentsDeployment(_) => (),
    }
}

fn post_commit_assets(proposal: &Proposal) -> Result<(), String> {
    match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(_) => (),
        ProposalType::SegmentsDeployment(ref options) => {
            return update_releases_metadata(options);
        }
    }

    Ok(())
}

fn copy_committed_assets(proposal_id: &ProposalId) -> Result<(), String> {
    // Copy from stable memory to heap.
    let assets = get_assets_stable(proposal_id);

    if assets.is_empty() {
        return Err(format!("Empty assets for proposal ID {}.", proposal_id));
    }

    for (key, asset) in assets {
        insert_asset(&key.full_path, &asset);

        for (encoding_type, encoding) in asset.encodings {
            let mut content_chunks = Vec::new();

            for (i, _) in encoding.content_chunks.iter().enumerate() {
                let chunks = get_content_chunks_stable(&encoding, i).ok_or_else(|| {
                    format!(
                        "No content chunks found for encoding {} at index {}.",
                        encoding_type, i
                    )
                })?;

                content_chunks.push(chunks);
            }

            if content_chunks.is_empty() {
                return Err(format!(
                    "Empty content chunks for encoding {}.",
                    encoding_type
                ));
            }

            let encoding_with_content = AssetEncoding {
                content_chunks,
                ..encoding
            };

            insert_asset_encoding(&key.full_path, &encoding_type, &encoding_with_content)?;
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
        return Err(ERROR_CANNOT_DELETE_PROPOSAL_ASSETS.to_string());
    }

    if proposal.status == ProposalStatus::Open {
        return Err(format!(
            "Proposal assets cannot be deleted. Current status: {:?}",
            proposal.status
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
        _ => return Err(ERROR_PROPOSAL_TYPE_NOT_SUPPORTED.to_string()),
    };

    Ok(())
}

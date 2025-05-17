use crate::proposals::errors::{
    JUNO_ERROR_PROPOSALS_CANNOT_COMMIT, JUNO_ERROR_PROPOSALS_CANNOT_COMMIT_INVALID_STATUS,
    JUNO_ERROR_PROPOSALS_EMPTY_ASSETS, JUNO_ERROR_PROPOSALS_EMPTY_CONTENT_CHUNKS,
    JUNO_ERROR_PROPOSALS_INVALID_HASH, JUNO_ERROR_PROPOSALS_NOT_CONTENT_CHUNKS_AT_INDEX,
};
use crate::proposals::stable::{get_proposal, insert_proposal};
use crate::proposals::workflows::assert::assert_known_proposal_type;
use crate::proposals::{CommitProposal, CommitProposalError, Proposal, ProposalId, ProposalStatus};
use crate::storage::heap::insert_asset;
use crate::storage::heap::store::insert_asset_encoding;
use crate::storage::stable::{get_assets, get_content_chunks};
use crate::strategies::{CdnHeapStrategy, CdnStableStrategy, CdnWorkflowStrategy};
use hex::encode;
use junobuild_storage::types::store::AssetEncoding;

pub fn commit_proposal(
    cdn_heap: &impl CdnHeapStrategy,
    cdn_stable: &impl CdnStableStrategy,
    cdn_workflow: &impl CdnWorkflowStrategy,
    proposition: &CommitProposal,
) -> Result<(), CommitProposalError> {
    let proposal = get_proposal(cdn_stable, &proposition.proposal_id).ok_or_else(|| {
        CommitProposalError::ProposalNotFound(format!(
            "{} ({})",
            JUNO_ERROR_PROPOSALS_CANNOT_COMMIT, proposition.proposal_id
        ))
    })?;

    match secure_commit_proposal(cdn_heap, cdn_stable, cdn_workflow, proposition, &proposal) {
        Ok(_) => {
            let executed_proposal = Proposal::execute(&proposal);
            insert_proposal(cdn_stable, &proposition.proposal_id, &executed_proposal);
            Ok(())
        }
        Err(e @ CommitProposalError::CommitAssetsIssue(_))
        | Err(e @ CommitProposalError::PostCommitAssetsIssue(_)) => {
            let failed_proposal = Proposal::fail(&proposal);
            insert_proposal(cdn_stable, &proposition.proposal_id, &failed_proposal);
            Err(e)
        }
        Err(e) => Err(e),
    }
}

fn secure_commit_proposal(
    cdn_heap: &impl CdnHeapStrategy,
    cdn_stable: &impl CdnStableStrategy,
    cdn_workflow: &impl CdnWorkflowStrategy,
    commit_proposal: &CommitProposal,
    proposal: &Proposal,
) -> Result<(), CommitProposalError> {
    if proposal.status != ProposalStatus::Open {
        return Err(CommitProposalError::ProposalNotOpen(format!(
            "{} ({:?})",
            JUNO_ERROR_PROPOSALS_CANNOT_COMMIT_INVALID_STATUS, proposal.status
        )));
    }

    match &proposal.sha256 {
        Some(sha256) if sha256 == &commit_proposal.sha256 => (),
        _ => {
            return Err(CommitProposalError::InvalidSha256(format!(
                "{} ({})",
                JUNO_ERROR_PROPOSALS_INVALID_HASH,
                encode(commit_proposal.sha256)
            )));
        }
    }

    assert_known_proposal_type(proposal).map_err(CommitProposalError::InvalidType)?;

    // Mark proposal as accepted.
    let accepted_proposal = Proposal::accept(proposal);
    insert_proposal(cdn_stable, &commit_proposal.proposal_id, &accepted_proposal);

    cdn_workflow.pre_commit_assets(proposal);

    copy_committed_assets(cdn_heap, cdn_stable, &commit_proposal.proposal_id)
        .map_err(CommitProposalError::CommitAssetsIssue)?;

    cdn_workflow
        .post_commit_assets(proposal)
        .map_err(CommitProposalError::PostCommitAssetsIssue)?;

    Ok(())
}

fn copy_committed_assets(
    cdn_heap: &impl CdnHeapStrategy,
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
) -> Result<(), String> {
    // Copy from stable memory to heap.
    let assets = get_assets(cdn_stable, proposal_id);

    if assets.is_empty() {
        return Err(format!(
            "{} ({})",
            JUNO_ERROR_PROPOSALS_EMPTY_ASSETS, proposal_id
        ));
    }

    for (key, asset) in assets {
        insert_asset(cdn_heap, &key.full_path, &asset);

        for (encoding_type, encoding) in asset.encodings {
            let mut content_chunks = Vec::new();

            for (i, _) in encoding.content_chunks.iter().enumerate() {
                let chunks = get_content_chunks(cdn_stable, &encoding, i).ok_or_else(|| {
                    format!(
                        "{} ({} - {}).",
                        JUNO_ERROR_PROPOSALS_NOT_CONTENT_CHUNKS_AT_INDEX, encoding_type, i
                    )
                })?;

                content_chunks.push(chunks);
            }

            if content_chunks.is_empty() {
                return Err(format!(
                    "{} ({})",
                    JUNO_ERROR_PROPOSALS_EMPTY_CONTENT_CHUNKS, encoding_type
                ));
            }

            let encoding_with_content = AssetEncoding {
                content_chunks,
                ..encoding
            };

            insert_asset_encoding(
                cdn_heap,
                &key.full_path,
                &encoding_type,
                &encoding_with_content,
            )?;
        }
    }

    Ok(())
}

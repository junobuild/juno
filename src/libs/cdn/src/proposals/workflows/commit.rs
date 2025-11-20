use crate::proposals::errors::{
    JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT, JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT_INVALID_STATUS,
    JUNO_CDN_PROPOSALS_ERROR_EMPTY_ASSETS, JUNO_CDN_PROPOSALS_ERROR_EMPTY_CONTENT_CHUNKS,
    JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH, JUNO_CDN_PROPOSALS_ERROR_NOT_CONTENT_CHUNKS_AT_INDEX,
};
use crate::proposals::workflows::assert::assert_known_proposal_type;
use crate::proposals::{get_proposal, insert_proposal};
use crate::proposals::{CommitProposal, CommitProposalError, Proposal, ProposalId, ProposalStatus};
use crate::storage::heap::get_rule;
use crate::storage::stable::{get_assets, get_content_chunks};
use crate::strategies::{
    CdnCommitAssetsStrategy, CdnHeapStrategy, CdnStableStrategy, CdnWorkflowStrategy,
};
use hex::encode;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_storage::types::store::AssetEncoding;
use std::collections::HashMap;

pub fn commit_proposal(
    cdn_heap: &impl CdnHeapStrategy,
    cdn_commit_assets: &impl CdnCommitAssetsStrategy,
    cdn_stable: &impl CdnStableStrategy,
    cdn_workflow: &impl CdnWorkflowStrategy,
    proposition: &CommitProposal,
) -> Result<(), CommitProposalError> {
    let proposal = get_proposal(cdn_stable, &proposition.proposal_id).ok_or_else(|| {
        CommitProposalError::ProposalNotFound(format!(
            "{} ({})",
            JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT, proposition.proposal_id
        ))
    })?;

    match secure_commit_proposal(
        cdn_heap,
        cdn_commit_assets,
        cdn_stable,
        cdn_workflow,
        proposition,
        &proposal,
    ) {
        Ok(_) => {
            let executed_proposal = Proposal::execute(&proposal);
            insert_proposal(cdn_stable, &proposition.proposal_id, &executed_proposal);
            Ok(())
        }
        Err(e @ CommitProposalError::CommitAssetsIssue(_))
        | Err(e @ CommitProposalError::PreCommitAssetsIssue(_))
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
    cdn_commit_assets: &impl CdnCommitAssetsStrategy,
    cdn_stable: &impl CdnStableStrategy,
    cdn_workflow: &impl CdnWorkflowStrategy,
    commit_proposal: &CommitProposal,
    proposal: &Proposal,
) -> Result<(), CommitProposalError> {
    if proposal.status != ProposalStatus::Open {
        return Err(CommitProposalError::ProposalNotOpen(format!(
            "{} ({:?})",
            JUNO_CDN_PROPOSALS_ERROR_CANNOT_COMMIT_INVALID_STATUS, proposal.status
        )));
    }

    match &proposal.sha256 {
        Some(sha256) if sha256 == &commit_proposal.sha256 => (),
        _ => {
            return Err(CommitProposalError::InvalidSha256(format!(
                "{} ({})",
                JUNO_CDN_PROPOSALS_ERROR_INVALID_HASH,
                encode(commit_proposal.sha256)
            )));
        }
    }

    assert_known_proposal_type(proposal).map_err(CommitProposalError::InvalidType)?;

    // Mark proposal as accepted.
    let accepted_proposal = Proposal::accept(proposal);
    insert_proposal(cdn_stable, &commit_proposal.proposal_id, &accepted_proposal);

    cdn_workflow
        .pre_commit_assets(proposal)
        .map_err(CommitProposalError::PreCommitAssetsIssue)?;

    copy_committed_assets(
        cdn_heap,
        cdn_commit_assets,
        cdn_stable,
        &commit_proposal.proposal_id,
    )
    .map_err(CommitProposalError::CommitAssetsIssue)?;

    cdn_workflow
        .post_commit_assets(proposal)
        .map_err(CommitProposalError::PostCommitAssetsIssue)?;

    Ok(())
}

fn copy_committed_assets(
    cdn_heap: &impl CdnHeapStrategy,
    cdn_commit_assets: &impl CdnCommitAssetsStrategy,
    cdn_stable: &impl CdnStableStrategy,
    proposal_id: &ProposalId,
) -> Result<(), String> {
    // Copy from stable memory to heap.
    let assets = get_assets(cdn_stable, proposal_id);

    if assets.is_empty() {
        return Err(format!(
            "{JUNO_CDN_PROPOSALS_ERROR_EMPTY_ASSETS} ({proposal_id})"
        ));
    }

    // We cache the rules for performance. With current implementation
    // there should be only one rule for all assets.
    let mut rule_cache: HashMap<CollectionKey, Rule> = HashMap::new();

    for (key, mut asset) in assets {
        let rule = rule_cache
            .entry(key.collection.clone())
            .or_insert_with(|| get_rule(cdn_heap, &key.collection).unwrap())
            .clone();

        let encodings = std::mem::take(&mut asset.encodings);

        for (encoding_type, encoding) in encodings {
            let mut content_chunks = Vec::new();

            for (i, _) in encoding.content_chunks.iter().enumerate() {
                let chunks = get_content_chunks(cdn_stable, &encoding, i).ok_or_else(|| {
                    format!(
                        "{JUNO_CDN_PROPOSALS_ERROR_NOT_CONTENT_CHUNKS_AT_INDEX} ({encoding_type} - {i})."
                    )
                })?;

                content_chunks.push(chunks);
            }

            if content_chunks.is_empty() {
                return Err(format!(
                    "{JUNO_CDN_PROPOSALS_ERROR_EMPTY_CONTENT_CHUNKS} ({encoding_type})"
                ));
            }

            let encoding_with_content = AssetEncoding {
                content_chunks,
                ..encoding
            };

            cdn_commit_assets.insert_asset_encoding(
                &key.full_path,
                &encoding_type,
                &encoding_with_content,
                &mut asset,
                &rule,
            );

            cdn_commit_assets.insert_asset(&key.collection, &key.full_path, &asset, &rule);
        }
    }

    Ok(())
}

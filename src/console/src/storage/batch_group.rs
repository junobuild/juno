use candid::Principal;
use junobuild_shared::utils::principal_not_equal;
use junobuild_storage::runtime::get_batch_group;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::store::{AssetEncoding, BatchGroup};
use crate::storage::state::stable::{get_assets_stable, get_batch_group_proposal, get_content_chunks_stable, insert_batch_group_proposal};
use crate::storage::types::state::{BatchGroupProposal, BatchGroupProposalStatus};
use sha2::{Digest, Sha256};
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_storage::types::interface::CommitBatchGroup;
use crate::storage::msg::ERROR_CANNOT_PROPOSE_BATCH_GROUP;
use hex::encode;
use crate::storage::state::heap::{insert_asset, insert_asset_encoding};

pub fn propose_batch_group(
    caller: Principal,
    batch_group_id: &BatchGroupId,
) -> Result<BatchGroupProposal, String> {
    let batch_group = get_batch_group(batch_group_id);

    match batch_group {
        None => Err(ERROR_CANNOT_PROPOSE_BATCH_GROUP.to_string()),
        Some(batch_group) => secure_propose_batch_group(caller, batch_group_id, &batch_group),
    }
}

pub fn commit_batch_group(
    commit_batch_group: &CommitBatchGroup,
) -> Result<(), String> {
    let batch_group = get_batch_group_proposal(&commit_batch_group.batch_group_id);

    match batch_group {
        None => Err(format!("{} {}", ERROR_CANNOT_PROPOSE_BATCH_GROUP.to_string(), commit_batch_group.batch_group_id)),
        Some(batch_group) => secure_commit_batch_group(commit_batch_group, &batch_group),
    }
}

fn secure_propose_batch_group(
    caller: Principal,
    batch_group_id: &BatchGroupId,
    batch_group: &BatchGroup,
) -> Result<BatchGroupProposal, String> {
    // The one that started the batch group should be the one that commits it
    if principal_not_equal(caller, batch_group.owner) {
        return Err(ERROR_CANNOT_PROPOSE_BATCH_GROUP.to_string());
    }

    let current_batch_group = get_batch_group_proposal(batch_group_id);

    if let Some(current_batch_group) = &current_batch_group {
        if current_batch_group.status != BatchGroupProposalStatus::Open {
            return Err(format!(
                "Batch group cannot be proposed. Current status: {:?}",
                current_batch_group.status
            ));
        }

        if principal_not_equal(current_batch_group.owner, caller) {
            return Err("Caller is not the owner of the batch group proposal.".to_string());
        }
    }

    let batch_groups_assets = get_assets_stable(batch_group_id);

    let mut hasher = Sha256::new();

    for (key, asset) in batch_groups_assets {
        hasher.update(key.hash());
        hasher.update(asset.hash());

        for (_, encoding) in asset.encodings {
            hasher.update(encoding.hash());
        }
    }

    let hash: Hash = hasher.finalize().into();

    let proposal: BatchGroupProposal = BatchGroupProposal::prepare(caller, &current_batch_group, hash);

    insert_batch_group_proposal(batch_group_id, &proposal);

    Ok(proposal)
}

fn secure_commit_batch_group(
    commit_batch_group: &CommitBatchGroup,
    batch_group: &BatchGroupProposal,
) -> Result<(), String> {
    if batch_group.status != BatchGroupProposalStatus::Open {
        return Err(format!(
            "Batch group cannot be committed. Current status: {:?}",
            batch_group.status
        ));
    }

    if batch_group.sha256 != commit_batch_group.sha256 {
        return Err(format!("The provided SHA-256 hash ({}) does not match the expected value for the batch group to commit.", encode(commit_batch_group.sha256)));
    }

    let batch_groups_assets = get_assets_stable(&commit_batch_group.batch_group_id);

    for (key, asset) in batch_groups_assets {
        insert_asset(&key.full_path, &asset);

        for (encoding_type, encoding) in asset.encodings {
            let mut content_chunks = Vec::new();

            for (i, _) in encoding.content_chunks.iter().enumerate() {
                let chunks = get_content_chunks_stable(&encoding, i).ok_or_else(|| format!("No content chunks found for encoding {} at index {}.", encoding_type, i))?;

                content_chunks.push(chunks);
            }

            if content_chunks.is_empty() {
                return Err(format!("Empty content chunks for encoding {}.", encoding_type));
            }

            let encoding_with_content: AssetEncoding = AssetEncoding {
                content_chunks,
                ..encoding
            };

            insert_asset_encoding(&key.full_path, &encoding_type, &encoding_with_content)?;
        }
    }

    Ok(())
}
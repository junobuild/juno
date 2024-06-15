use crate::msg::ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE;
use crate::storage::state::heap::{insert_asset, insert_asset_encoding};
use crate::storage::state::stable::{get_assets_stable, get_content_chunks_stable};
use crate::store::stable::{count_proposals, get_proposal, insert_proposal};
use crate::types::interface::CommitAssetsUpgrade;
use crate::types::state::{Proposal, ProposalId, ProposalStatus, ProposalType};
use candid::Principal;
use hex::encode;
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_shared::utils::principal_not_equal;
use junobuild_storage::runtime::get_batch_group;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::store::{AssetEncoding, BatchGroup};
use sha2::{Digest, Sha256};

pub fn propose_assets_upgrade(
    caller: Principal,
    batch_group_id: &BatchGroupId,
) -> Result<(ProposalId, Proposal), String> {
    let batch_group = get_batch_group(batch_group_id);

    match batch_group {
        None => Err(ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE.to_string()),
        Some(batch_group) => secure_propose_assets_upgrade(caller, batch_group_id, &batch_group),
    }
}

pub fn commit_assets_upgrade(assets_upgrade: &CommitAssetsUpgrade) -> Result<(), String> {
    let proposal = get_proposal(&assets_upgrade.proposal_id);

    match proposal {
        None => Err(format!(
            "{} {}",
            ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE, assets_upgrade.proposal_id
        )),
        Some(proposal) => secure_commit_assets_upgrade(assets_upgrade, &proposal),
    }
}

fn secure_propose_assets_upgrade(
    caller: Principal,
    batch_group_id: &BatchGroupId,
    batch_group: &BatchGroup,
) -> Result<(ProposalId, Proposal), String> {
    // The one that started the batch group should be the one that commits it
    if principal_not_equal(caller, batch_group.owner) {
        return Err(ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE.to_string());
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

    let proposal_id =
        u128::try_from(count_proposals() + 1).map_err(|_| "Cannot convert next proposal ID.")?;
    let proposal: Proposal = Proposal::open(caller, hash, ProposalType::AssetsUpgrade);

    insert_proposal(&proposal_id, &proposal);

    Ok((proposal_id, proposal))
}

fn secure_commit_assets_upgrade(
    assets_upgrade: &CommitAssetsUpgrade,
    proposal: &Proposal,
) -> Result<(), String> {
    if proposal.status != ProposalStatus::Open {
        return Err(format!(
            "Proposal cannot be committed. Current status: {:?}",
            proposal.status
        ));
    }

    if proposal.sha256 != assets_upgrade.sha256 {
        return Err(format!("The provided SHA-256 hash ({}) does not match the expected value for the proposal to commit.", encode(assets_upgrade.sha256)));
    }

    // Mark proposal as accepted.
    let accepted_proposal = Proposal::accept(proposal);
    insert_proposal(&assets_upgrade.proposal_id, &accepted_proposal);

    // Copy from stable memory to heap.
    let assets = get_assets_stable(&assets_upgrade.proposal_id);

    for (key, asset) in assets {
        insert_asset(&key.full_path, &asset);

        for (encoding_type, encoding) in asset.encodings {
            let mut content_chunks = Vec::with_capacity(encoding.content_chunks.len());

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

    // Mark proposal as executed.
    let executed_proposal = Proposal::execute(proposal);
    insert_proposal(&assets_upgrade.proposal_id, &executed_proposal);

    Ok(())
}

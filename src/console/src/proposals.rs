use crate::msg::ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE;
use crate::storage::state::heap::insert_asset;
use crate::storage::state::stable::{get_assets_stable, get_content_chunks_stable};
use crate::storage::store::{delete_assets, insert_asset_encoding};
use crate::store::stable::{count_proposals, get_proposal, insert_proposal};
use crate::types::interface::CommitAssetsUpgrade;
use crate::types::state::{
    AssetsUpgradeOptions, Proposal, ProposalId, ProposalStatus, ProposalType,
};
use candid::Principal;
use hex::encode;
use junobuild_collections::constants::ASSET_COLLECTION_KEY;
use junobuild_shared::types::core::{Hash, Hashable};
use junobuild_shared::utils::principal_not_equal;
use junobuild_storage::types::store::AssetEncoding;
use sha2::{Digest, Sha256};

pub fn init_assets_upgrade(
    caller: Principal,
    options: AssetsUpgradeOptions,
) -> Result<(ProposalId, Proposal), String> {
    let proposal_id =
        u128::try_from(count_proposals() + 1).map_err(|_| "Cannot convert next proposal ID.")?;

    let proposal: Proposal = Proposal::init(caller, ProposalType::AssetsUpgrade(options));

    insert_proposal(&proposal_id, &proposal);

    Ok((proposal_id, proposal))
}

pub fn propose_assets_upgrade(
    caller: Principal,
    proposal_id: &ProposalId,
) -> Result<(ProposalId, Proposal), String> {
    let proposal = get_proposal(proposal_id);

    match proposal {
        None => Err(ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE.to_string()),
        Some(proposal) => secure_propose_assets_upgrade(caller, proposal_id, &proposal),
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
    proposal_id: &ProposalId,
    proposal: &Proposal,
) -> Result<(ProposalId, Proposal), String> {
    // The one that started the upload should be the one that propose it.
    if principal_not_equal(caller, proposal.owner) {
        return Err(ERROR_CANNOT_PROPOSE_ASSETS_UPGRADE.to_string());
    }

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

    match &proposal.sha256 {
        Some(sha256) if sha256 == &assets_upgrade.sha256 => (),
        _ => {
            return Err(format!("The provided SHA-256 hash ({}) does not match the expected value for the proposal to commit.", encode(assets_upgrade.sha256)));
        }
    }

    #[allow(unreachable_patterns)]
    let options = match &proposal.proposal_type {
        ProposalType::AssetsUpgrade(ref options) => options,
        _ => return Err("Proposal is not of type AssetsUpgrade.".to_string()),
    };

    // Mark proposal as accepted.
    let accepted_proposal = Proposal::accept(proposal);
    insert_proposal(&assets_upgrade.proposal_id, &accepted_proposal);

    // Clear existing assets if required.
    if let Some(true) = options.clear_existing_assets {
        delete_assets(&ASSET_COLLECTION_KEY.to_string());
    }

    // Copy from stable memory to heap.
    let assets = get_assets_stable(&assets_upgrade.proposal_id);

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

    // Mark proposal as executed.
    let executed_proposal = Proposal::execute(proposal);
    insert_proposal(&assets_upgrade.proposal_id, &executed_proposal);

    Ok(())
}

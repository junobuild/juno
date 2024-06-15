use crate::storage::certified_assets::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::heap::{
    delete_domain, get_asset, get_config, get_domain, get_domains, insert_config, insert_domain,
};
use crate::storage::state::stable::{get_proposal, get_proposal_assets, insert_proposal};
use crate::storage::strategy_impls::StorageState;
use crate::storage::types::state::{Proposal, ProposalStatus};
use candid::Principal;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::types::core::{DomainName, Hash, Hashable};
use junobuild_shared::utils::principal_not_equal;
use junobuild_storage::msg::ERROR_CANNOT_COMMIT_BATCH_GROUP;
use junobuild_storage::runtime::get_batch_group;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::CustomDomains;
use junobuild_storage::types::runtime_state::BatchGroupId;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::{Asset, BatchGroup};
use junobuild_storage::utils::get_token_protected_asset;
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;
use sha2::{Digest, Sha256};

pub fn get_public_asset(full_path: FullPath, token: Option<String>) -> Option<(Asset, Memory)> {
    let asset = get_asset(&full_path);

    match asset {
        None => None,
        Some(asset) => match &asset.key.token {
            None => Some((asset.clone(), Memory::Heap)),
            Some(asset_token) => {
                let protected_asset = get_token_protected_asset(&asset, asset_token, token);
                protected_asset.map(|protected_asset| (protected_asset, Memory::Heap))
            }
        },
    }
}

///
/// Config
///

pub fn set_config_store(config: &StorageConfig) {
    insert_config(config);

    init_runtime_certified_assets();
}

pub fn get_config_store() -> StorageConfig {
    get_config()
}

///
/// Domain
///

// TODO: following functions are really similar to those of the satellite, maybe some day we can refactor those.

pub fn get_custom_domains_store() -> CustomDomains {
    get_domains()
}

pub fn set_domain_store(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

pub fn delete_domain_store(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_domain(domain_name);

    update_custom_domains_asset(&StorageState)
}

fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset(&StorageState)
}

fn set_state_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_domain(domain_name);

    let custom_domain = build_custom_domain(domain, bn_id);

    insert_domain(domain_name, &custom_domain);
}

///
/// Upload
///

pub fn commit_assets_proposal(
    caller: Principal,
    batch_group_id: &BatchGroupId,
) -> Result<Proposal, String> {
    let batch_group = get_batch_group(batch_group_id);

    match batch_group {
        None => Err(ERROR_CANNOT_COMMIT_BATCH_GROUP.to_string()),
        Some(batch_group) => secure_commit_assets_proposal(caller, batch_group_id, &batch_group),
    }
}

fn secure_commit_assets_proposal(
    caller: Principal,
    batch_group_id: &BatchGroupId,
    batch_group: &BatchGroup,
) -> Result<Proposal, String> {
    // The one that started the batch group should be the one that commits it
    if principal_not_equal(caller, batch_group.owner) {
        return Err(ERROR_CANNOT_COMMIT_BATCH_GROUP.to_string());
    }

    let current_proposal = get_proposal(batch_group_id);

    if let Some(current_proposal) = &current_proposal {
        if current_proposal.status != ProposalStatus::Open {
            return Err(format!(
                "Proposal cannot be committed. Current status: {:?}",
                current_proposal.status
            ));
        }

        if principal_not_equal(current_proposal.owner, caller) {
            return Err("Caller is not the owner of the proposal.".to_string());
        }
    }

    let batch_groups_assets = get_proposal_assets(batch_group_id);

    let mut hasher = Sha256::new();

    for (key, asset) in batch_groups_assets {
        hasher.update(key.hash());
        hasher.update(asset.hash());

        for (_, encoding) in asset.encodings {
            hasher.update(encoding.hash());
        }
    }

    let hash: Hash = hasher.finalize().into();

    let proposal: Proposal = Proposal::prepare(caller, &current_proposal, hash);

    insert_proposal(batch_group_id, &proposal);

    Ok(proposal)
}

use crate::storage::runtime::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::heap::{
    delete_domain, get_asset, get_config, get_domain, get_domains, insert_config, insert_domain,
};
use crate::storage::strategy_impls::StorageState;
use ic_cdk::api::time;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::state::{Timestamp, Version};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;
use junobuild_storage::utils::get_token_protected_asset;
use junobuild_storage::well_known::update::update_custom_domains_asset;

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

pub fn get_custom_domains_store() -> CustomDomains {
    get_domains()
}

// TODO: same as in satellite basically
pub fn set_domain_store(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_domain_impl(domain_name, bn_id)
}

// TODO: same as in satellite basically
pub fn delete_domain_store(domain_name: &DomainName) -> Result<(), String> {
    delete_domain_impl(domain_name)
}

// TODO: same as in satellite basically
fn delete_domain_impl(domain_name: &DomainName) -> Result<(), String> {
    delete_domain(domain_name);

    update_custom_domains_asset(&StorageState)
}

// TODO: same as in satellite basically
fn set_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) -> Result<(), String> {
    set_state_domain_impl(domain_name, bn_id);

    update_custom_domains_asset(&StorageState)
}

// TODO: same as in satellite
fn set_state_domain_impl(domain_name: &DomainName, bn_id: &Option<String>) {
    let domain = get_domain(domain_name);

    let now = time();

    let created_at: Timestamp = match domain.clone() {
        None => now,
        Some(domain) => domain.created_at,
    };

    let version: Version = match domain {
        None => INITIAL_VERSION,
        Some(domain) => domain.version.unwrap_or_default() + 1,
    };

    let updated_at: Timestamp = now;

    let custom_domain = CustomDomain {
        bn_id: bn_id.to_owned(),
        created_at,
        updated_at,
        version: Some(version),
    };

    insert_domain(domain_name, &custom_domain);
}

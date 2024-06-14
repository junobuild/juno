use crate::storage::certified_assets::init_certified_assets as init_runtime_certified_assets;
use crate::storage::state::heap::{
    delete_domain, get_asset, get_config, get_domain, get_domains, insert_config, insert_domain,
};
use crate::storage::strategy_impls::StorageState;
use junobuild_collections::types::rules::Memory;
use junobuild_shared::types::core::DomainName;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::CustomDomains;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;
use junobuild_storage::utils::get_token_protected_asset;
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;

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

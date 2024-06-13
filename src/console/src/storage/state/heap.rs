use crate::storage::types::state::{AssetsHeap, StorageHeapState};
use crate::types::state::HeapState;
use crate::STATE;
use junobuild_collections::msg::COLLECTION_NOT_FOUND;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::types::core::{CollectionKey, DomainName};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    STATE.with(|state| get_asset_impl(full_path, &state.borrow().heap.get_storage().assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset) {
    STATE.with(|state| insert_asset_impl(full_path, asset, &mut state.borrow_mut().heap))
}

fn insert_asset_impl(full_path: &FullPath, asset: &Asset, heap: &mut HeapState) {
    let storage = heap.storage.get_or_insert_with(StorageHeapState::default);
    storage.assets.insert(full_path.clone(), asset.clone());
}

pub fn delete_asset(full_path: &FullPath) -> Option<Asset> {
    STATE.with(|state| delete_asset_impl(full_path, &mut state.borrow_mut().heap))
}

fn delete_asset_impl(full_path: &FullPath, heap: &mut HeapState) -> Option<Asset> {
    let storage = heap.storage.get_or_insert_with(StorageHeapState::default);
    storage.assets.remove(full_path)
}

/// Rules

// TODO: almost same as satellite except get_storage()

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.get_storage().rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rule) => Ok(rule),
    }
}

///
/// Config
///

// TODO: almost same as satellite except get_storage()

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.get_storage().config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap))
}

fn insert_config_impl(config: &StorageConfig, heap: &mut HeapState) {
    let storage = heap.storage.get_or_insert_with(StorageHeapState::default);
    storage.config = config.clone();
}

/// Custom domains

// TODO: almost same as satellite except get_storage()

pub fn get_domains() -> CustomDomains {
    STATE.with(|state| state.borrow().heap.get_storage().custom_domains.clone())
}

pub fn get_domain(domain_name: &DomainName) -> Option<CustomDomain> {
    STATE.with(|state| {
        let domains = state.borrow().heap.get_storage().custom_domains.clone();
        let domain = domains.get(domain_name);
        domain.cloned()
    })
}

pub fn insert_domain(domain_name: &DomainName, custom_domain: &CustomDomain) {
    STATE.with(|state| insert_domain_impl(domain_name, custom_domain, &mut state.borrow_mut().heap))
}

pub fn delete_domain(domain_name: &DomainName) {
    STATE.with(|state| delete_domain_impl(domain_name, &mut state.borrow_mut().heap))
}

fn insert_domain_impl(
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
    heap: &mut HeapState,
) {
    let storage = heap.storage.get_or_insert_with(StorageHeapState::default);
    storage
        .custom_domains
        .insert(domain_name.clone(), custom_domain.clone());
}

fn delete_domain_impl(domain_name: &DomainName, heap: &mut HeapState) {
    let storage = heap.storage.get_or_insert_with(StorageHeapState::default);
    storage.custom_domains.remove(domain_name);
}

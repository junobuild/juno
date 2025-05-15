use crate::memory::STATE;
use crate::storage::strategy_impls::CdnHeap;
use junobuild_cdn::state::heap::{
    collect_delete_assets as cdn_collect_delete_assets, delete_asset as cdn_delete_asset,
    get_asset as cdn_get_asset, insert_asset as cdn_insert_asset,
};
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::heap_utils::collect_delete_assets_heap;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{AssetsHeap, FullPath, StorageHeapState};
use junobuild_storage::types::store::Asset;

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    cdn_get_asset(&CdnHeap, full_path)
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset) {
    cdn_insert_asset(&CdnHeap, full_path, asset)
}

pub fn delete_asset(full_path: &FullPath) -> Option<Asset> {
    cdn_delete_asset(&CdnHeap, full_path)
}

pub fn collect_delete_assets(collection: &CollectionKey) -> Vec<FullPath> {
    cdn_collect_delete_assets(&CdnHeap, collection)
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let rules = &state.borrow().heap.storage.rules.clone();
        let rule = rules.get(collection);

        rule.cloned()
    });

    match rule {
        None => Err(msg_storage_collection_not_found(collection)),
        Some(rule) => Ok(rule),
    }
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> StorageConfig {
    STATE.with(|state| state.borrow().heap.storage.config.clone())
}

pub fn insert_config(config: &StorageConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.storage))
}

fn insert_config_impl(config: &StorageConfig, storage: &mut StorageHeapState) {
    storage.config = config.clone();
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn get_domains() -> CustomDomains {
    STATE.with(|state| state.borrow().heap.storage.custom_domains.clone())
}

pub fn get_domain(domain_name: &DomainName) -> Option<CustomDomain> {
    STATE.with(|state| {
        let domains = state.borrow().heap.storage.custom_domains.clone();
        let domain = domains.get(domain_name);
        domain.cloned()
    })
}

pub fn insert_domain(domain_name: &DomainName, custom_domain: &CustomDomain) {
    STATE.with(|state| {
        insert_domain_impl(
            domain_name,
            custom_domain,
            &mut state.borrow_mut().heap.storage,
        )
    })
}

pub fn delete_domain(domain_name: &DomainName) {
    STATE.with(|state| delete_domain_impl(domain_name, &mut state.borrow_mut().heap.storage))
}

fn insert_domain_impl(
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
    storage: &mut StorageHeapState,
) {
    storage
        .custom_domains
        .insert(domain_name.clone(), custom_domain.clone());
}

fn delete_domain_impl(domain_name: &DomainName, storage: &mut StorageHeapState) {
    storage.custom_domains.remove(domain_name);
}

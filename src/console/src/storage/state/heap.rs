use crate::memory::STATE;
use crate::storage::strategy_impls::CdnHeap;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{FullPath, StorageHeapState};
use junobuild_storage::types::store::Asset;

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    junobuild_cdn::heap::get_asset(&CdnHeap, full_path)
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset) {
    junobuild_cdn::heap::insert_asset(&CdnHeap, full_path, asset)
}

pub fn delete_asset(full_path: &FullPath) -> Option<Asset> {
    junobuild_cdn::heap::delete_asset(&CdnHeap, full_path)
}

pub fn collect_delete_assets(collection: &CollectionKey) -> Vec<FullPath> {
    junobuild_cdn::heap::collect_delete_assets(&CdnHeap, collection)
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    junobuild_cdn::heap::get_rule(&CdnHeap, collection)
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> StorageConfig {
    junobuild_cdn::heap::get_config(&CdnHeap)
}

pub fn insert_config(config: &StorageConfig) {
    junobuild_cdn::heap::insert_config(&CdnHeap, config)
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

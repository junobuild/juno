use crate::strategies_impls::cdn::CdnHeap;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::FullPath;
use junobuild_storage::types::store::Asset;

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_asset(full_path: &FullPath) -> Option<Asset> {
    junobuild_cdn::storage::heap::get_asset(&CdnHeap, full_path)
}

pub fn insert_asset(full_path: &FullPath, asset: &Asset) {
    junobuild_cdn::storage::heap::insert_asset(&CdnHeap, full_path, asset)
}

pub fn delete_asset(full_path: &FullPath) -> Option<Asset> {
    junobuild_cdn::storage::heap::delete_asset(&CdnHeap, full_path)
}

pub fn collect_delete_assets(collection: &CollectionKey) -> Vec<FullPath> {
    junobuild_cdn::storage::heap::collect_delete_assets(&CdnHeap, collection)
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    junobuild_cdn::storage::heap::get_rule(&CdnHeap, collection)
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}

pub fn insert_config(config: &StorageConfig) {
    junobuild_cdn::storage::heap::insert_config(&CdnHeap, config)
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn get_domains() -> CustomDomains {
    junobuild_cdn::storage::heap::get_domains(&CdnHeap)
}

pub fn get_domain(domain_name: &DomainName) -> Option<CustomDomain> {
    junobuild_cdn::storage::heap::get_domain(&CdnHeap, domain_name)
}

pub fn insert_domain(domain_name: &DomainName, custom_domain: &CustomDomain) {
    junobuild_cdn::storage::heap::insert_domain(&CdnHeap, domain_name, custom_domain)
}

pub fn delete_domain(domain_name: &DomainName) {
    junobuild_cdn::storage::heap::delete_domain(&CdnHeap, domain_name)
}

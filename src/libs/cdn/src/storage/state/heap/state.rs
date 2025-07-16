use crate::strategies::CdnHeapStrategy;
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::heap_utils::collect_delete_assets_heap;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::state::{AssetsHeap, FullPath};
use junobuild_storage::types::store::Asset;

// ---------------------------------------------------------
// Assets
// ---------------------------------------------------------

pub fn get_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath) -> Option<Asset> {
    cdn_heap.with_assets(|assets| get_asset_impl(full_path, assets))
}

fn get_asset_impl(full_path: &FullPath, assets: &AssetsHeap) -> Option<Asset> {
    let value = assets.get(full_path);
    value.cloned()
}

pub fn insert_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath, asset: &Asset) {
    cdn_heap.with_assets_mut(|assets| insert_asset_impl(full_path, asset, assets))
}

fn insert_asset_impl(full_path: &FullPath, asset: &Asset, assets: &mut AssetsHeap) {
    assets.insert(full_path.clone(), asset.clone());
}

pub fn delete_asset(cdn_heap: &impl CdnHeapStrategy, full_path: &FullPath) -> Option<Asset> {
    cdn_heap.with_assets_mut(|assets| delete_asset_impl(full_path, assets))
}

fn delete_asset_impl(full_path: &FullPath, assets: &mut AssetsHeap) -> Option<Asset> {
    assets.remove(full_path)
}

pub fn collect_delete_assets(
    cdn_heap: &impl CdnHeapStrategy,
    collection: &CollectionKey,
) -> Vec<FullPath> {
    cdn_heap.with_assets(|assets| collect_delete_assets_heap(collection, assets))
}

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(
    cdn_heap: &impl CdnHeapStrategy,
    collection: &CollectionKey,
) -> Result<Rule, String> {
    let rule = cdn_heap.with_rules(|rules| {
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

pub fn get_config(cdn_heap: &impl CdnHeapStrategy) -> StorageConfig {
    cdn_heap.with_config(|config| config.clone())
}

pub fn insert_config(cdn_heap: &impl CdnHeapStrategy, config: &StorageConfig) {
    cdn_heap.with_config_mut(|current_config| insert_config_impl(config, current_config))
}

fn insert_config_impl(config: &StorageConfig, storage_config: &mut StorageConfig) {
    *storage_config = config.clone();
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn get_domains(cdn_heap: &impl CdnHeapStrategy) -> CustomDomains {
    cdn_heap.with_domains(|domains| domains.clone())
}

pub fn get_domain(
    cdn_heap: &impl CdnHeapStrategy,
    domain_name: &DomainName,
) -> Option<CustomDomain> {
    cdn_heap.with_domains(|domains| {
        let domain = domains.get(domain_name);
        domain.cloned()
    })
}

pub fn insert_domain(
    cdn_heap: &impl CdnHeapStrategy,
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
) {
    cdn_heap.with_domains_mut(|domains| insert_domain_impl(domain_name, custom_domain, domains))
}

fn insert_domain_impl(
    domain_name: &DomainName,
    custom_domain: &CustomDomain,
    domains: &mut CustomDomains,
) {
    domains.insert(domain_name.clone(), custom_domain.clone());
}

pub fn delete_domain(cdn_heap: &impl CdnHeapStrategy, domain_name: &DomainName) {
    cdn_heap.with_domains_mut(|domains| delete_domain_impl(domain_name, domains))
}

fn delete_domain_impl(domain_name: &DomainName, domains: &mut CustomDomains) {
    domains.remove(domain_name);
}

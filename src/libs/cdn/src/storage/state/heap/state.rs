use crate::strategies::CdnHeapStrategy;
use junobuild_collections::msg::msg_storage_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Rule;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::{CustomDomain, CustomDomains};
use junobuild_storage::types::config::StorageConfig;

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

use crate::storage::assert_set_config;
use crate::storage::heap::{delete_domain, get_config, get_domain, insert_config, insert_domain};
use crate::strategies::CdnHeapStrategy;
use junobuild_shared::types::core::DomainName;
use junobuild_storage::strategies::StorageStateStrategy;
use junobuild_storage::types::config::StorageConfig;
use junobuild_storage::types::interface::SetStorageConfig;
use junobuild_storage::well_known::update::update_custom_domains_asset;
use junobuild_storage::well_known::utils::build_custom_domain;

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn set_config_store(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
    proposed_config: &SetStorageConfig,
) -> Result<StorageConfig, String> {
    let current_config = get_config(cdn_heap);

    assert_set_config(proposed_config, &current_config)?;

    let config = StorageConfig::prepare(&current_config, proposed_config);

    insert_config(cdn_heap, &config);

    storage_state.init_certified_assets();

    Ok(config)
}

// ---------------------------------------------------------
// Domain
// ---------------------------------------------------------

pub fn set_domain_store(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
    domain_name: &DomainName,
    bn_id: &Option<String>,
) -> Result<(), String> {
    set_state_domain(cdn_heap, domain_name, bn_id);

    update_custom_domains_asset(storage_state)
}

fn set_state_domain(
    cdn_heap: &impl CdnHeapStrategy,
    domain_name: &DomainName,
    bn_id: &Option<String>,
) {
    let domain = get_domain(cdn_heap, domain_name);

    let custom_domain = build_custom_domain(domain, bn_id);

    insert_domain(cdn_heap, domain_name, &custom_domain);
}

pub fn delete_domain_store(
    cdn_heap: &impl CdnHeapStrategy,
    storage_state: &impl StorageStateStrategy,
    domain_name: &DomainName,
) -> Result<(), String> {
    delete_domain(cdn_heap, domain_name);

    update_custom_domains_asset(storage_state)
}

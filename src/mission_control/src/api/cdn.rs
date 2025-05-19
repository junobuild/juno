use ic_cdk::trap;
use ic_cdk_macros::{query, update};
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;
use junobuild_storage::types::config::StorageConfig;
use crate::cdn::strategies_impls::cdn::CdnHeap;
use crate::guards::caller_is_user_or_admin_controller;

// ---------------------------------------------------------
// Storage config
// ---------------------------------------------------------

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn set_storage_config(config: StorageConfig) {
    junobuild_cdn::storage::set_config_store(&CdnHeap, &StorageState, &config);
}

#[query(guard = "caller_is_user_or_admin_controller")]
pub fn get_storage_config() -> StorageConfig {
    junobuild_cdn::storage::heap::get_config(&CdnHeap)
}

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

#[query(guard = "caller_is_user_or_admin_controller")]
pub fn list_custom_domains() -> CustomDomains {
    junobuild_cdn::storage::heap::get_domains(&CdnHeap)
}

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    junobuild_cdn::storage::set_domain_store(&CdnHeap, &StorageState, &domain_name, &bn_id)
        .unwrap_or_else(|e| trap(&e));
}

#[update(guard = "caller_is_user_or_admin_controller")]
pub fn del_custom_domain(domain_name: DomainName) {
    junobuild_cdn::storage::delete_domain_store(&CdnHeap, &StorageState, &domain_name)
        .unwrap_or_else(|e| trap(&e));
}
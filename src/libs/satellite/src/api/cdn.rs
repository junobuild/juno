use crate::storage::store::{delete_domain_store, get_custom_domains_store, set_domain_store};
use ic_cdk::trap;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::domain::CustomDomains;

// ---------------------------------------------------------
// Custom domains
// ---------------------------------------------------------

pub fn list_custom_domains() -> CustomDomains {
    get_custom_domains_store()
}

pub fn set_custom_domain(domain_name: DomainName, bn_id: Option<String>) {
    set_domain_store(&domain_name, &bn_id).unwrap_or_else(|e| trap(&e));
}

pub fn del_custom_domain(domain_name: DomainName) {
    delete_domain_store(&domain_name).unwrap_or_else(|e| trap(&e));
}

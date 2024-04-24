use crate::storage::store::get_custom_domains_store;
use crate::storage::well_known::update::update_custom_domains_asset;

/// One time upgrade

// Re-init custom domains for those who have run juno clear before bug #484 was fixed.
pub fn init_custom_domains() {
    let custom_domains = get_custom_domains_store();

    if !custom_domains.is_empty() {
        let _ = update_custom_domains_asset();
    }
}

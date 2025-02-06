use crate::constants::{WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::types::store::{Asset, AssetKey};
use crate::utils::{create_asset_with_content, map_content_type_headers};
use ic_cdk::api::time;
use ic_cdk::id;
use junobuild_collections::constants::ASSET_COLLECTION_KEY;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::types::domain::CustomDomain;
use junobuild_shared::types::state::{Timestamp, Version};
use junobuild_shared::version::next_version;

pub fn map_custom_domains_asset(custom_domains: &str, existing_asset: Option<Asset>) -> Asset {
    let key = AssetKey {
        name: "custom-domains".to_string(),
        full_path: WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        token: None,
        collection: ASSET_COLLECTION_KEY.to_string(),
        owner: id(),
        description: None,
    };

    let headers = map_content_type_headers("application/octet-stream");

    create_asset_with_content(custom_domains, &headers, existing_asset, key)
}

pub fn map_alternative_origins_asset(
    alternative_origins: &str,
    existing_asset: Option<Asset>,
) -> Asset {
    let key = AssetKey {
        name: "ii-alternative-origins".to_string(),
        full_path: WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string(),
        token: None,
        collection: ASSET_COLLECTION_KEY.to_string(),
        owner: id(),
        description: None,
    };

    let headers = map_content_type_headers("application/json");

    create_asset_with_content(alternative_origins, &headers, existing_asset, key)
}

pub fn build_custom_domain(domain: Option<CustomDomain>, bn_id: &Option<String>) -> CustomDomain {
    let now = time();

    let created_at: Timestamp = match domain.clone() {
        None => now,
        Some(domain) => domain.created_at,
    };

    let version = next_version(&domain);

    let updated_at: Timestamp = now;

    CustomDomain {
        bn_id: bn_id.to_owned(),
        created_at,
        updated_at,
        version: Some(version),
    }
}

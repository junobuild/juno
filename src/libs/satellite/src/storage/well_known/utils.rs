use crate::rules::constants::ASSET_COLLECTION_KEY;
use crate::storage::constants::{
    ASSET_ENCODING_NO_COMPRESSION, WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use crate::storage::http::types::HeaderField;
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey};
use ic_cdk::api::time;
use ic_cdk::id;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::types::state::{Timestamp, Version};
use std::collections::HashMap;

pub fn map_custom_domains_asset(custom_domains: &String, existing_asset: Option<Asset>) -> Asset {
    let now = time();

    let key = AssetKey {
        name: "custom-domains".to_string(),
        full_path: WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        token: None,
        collection: ASSET_COLLECTION_KEY.to_string(),
        owner: id(),
        description: None,
    };

    let created_at: Timestamp = match existing_asset.clone() {
        None => now,
        Some(existing_asset) => existing_asset.created_at,
    };

    let version: Version = match existing_asset {
        None => INITIAL_VERSION,
        Some(existing_asset) => existing_asset.version.unwrap_or_default() + 1,
    };

    let mut asset: Asset = Asset {
        key,
        headers: Vec::from([HeaderField(
            "content-type".to_string(),
            "application/octet-stream".to_string(),
        )]),
        encodings: HashMap::new(),
        created_at,
        updated_at: now,
        version: Some(version),
    };

    let chunks = Vec::from([custom_domains.as_bytes().to_vec()]);

    asset.encodings.insert(
        ASSET_ENCODING_NO_COMPRESSION.to_string(),
        AssetEncoding::from(&chunks),
    );

    asset
}

pub fn map_alternative_origins_asset(
    alternative_origins: &String,
    existing_asset: Option<Asset>,
) -> Asset {
    let now = time();

    let key = AssetKey {
        name: "ii-alternative-origins".to_string(),
        full_path: WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string(),
        token: None,
        collection: ASSET_COLLECTION_KEY.to_string(),
        owner: id(),
        description: None,
    };

    let created_at: Timestamp = match existing_asset.clone() {
        None => now,
        Some(existing_asset) => existing_asset.created_at,
    };

    let version: Version = match existing_asset {
        None => INITIAL_VERSION,
        Some(existing_asset) => existing_asset.version.unwrap_or_default() + 1,
    };

    let mut asset: Asset = Asset {
        key,
        headers: Vec::from([HeaderField(
            "content-type".to_string(),
            "application/json".to_string(),
        )]),
        encodings: HashMap::new(),
        created_at,
        updated_at: now,
        version: Some(version),
    };

    let chunks = Vec::from([alternative_origins.as_bytes().to_vec()]);

    asset.encodings.insert(
        ASSET_ENCODING_NO_COMPRESSION.to_string(),
        AssetEncoding::from(&chunks),
    );

    asset
}

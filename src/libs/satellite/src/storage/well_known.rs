use crate::rules::constants::{ASSET_COLLECTION_KEY, DEFAULT_ASSETS_COLLECTIONS};
use crate::storage::constants::{ASSET_ENCODING_NO_COMPRESSION, WELL_KNOWN_II_ALTERNATIVE_ORIGINS};
use crate::storage::http::types::HeaderField;
use crate::storage::runtime::{delete_certified_asset, update_certified_asset};
use crate::storage::state::{delete_asset, get_asset, get_rule, insert_asset};
use crate::storage::store::get_config_store;
use crate::storage::types::store::{Asset, AssetEncoding, AssetKey};
use ic_cdk::api::time;
use ic_cdk::id;
use std::collections::HashMap;

pub fn update_alternative_origins_asset(alternative_origins: &String) -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    let collection = DEFAULT_ASSETS_COLLECTIONS[0].0.to_string();

    // #app collection rule
    let rule = get_rule(&collection)?;

    let existing_asset = get_asset(&collection, &full_path, &rule);

    let asset = map_alternative_origins_asset(alternative_origins, existing_asset);

    insert_asset(&collection, &full_path, &asset, &rule);

    let config = get_config_store();

    update_certified_asset(&asset, &config);

    Ok(())
}

pub fn delete_alternative_origins_asset() -> Result<(), String> {
    let full_path = WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string();

    let collection = DEFAULT_ASSETS_COLLECTIONS[0].0.to_string();

    // #app collection rule
    let rule = get_rule(&collection)?;

    let asset = delete_asset(&collection, &full_path, &rule);

    if let Some(asset) = asset {
        delete_certified_asset(&asset);
    }

    Ok(())
}

fn map_alternative_origins_asset(
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

    let mut asset: Asset = Asset {
        key,
        headers: Vec::from([HeaderField(
            "content-type".to_string(),
            "application/json".to_string(),
        )]),
        encodings: HashMap::new(),
        created_at: now,
        updated_at: now,
    };

    match existing_asset {
        None => (),
        Some(existing_asset) => asset.created_at = existing_asset.created_at,
    }

    let chunks = Vec::from([alternative_origins.as_bytes().to_vec()]);

    asset.encodings.insert(
        ASSET_ENCODING_NO_COMPRESSION.to_string(),
        AssetEncoding::from(&chunks),
    );

    asset
}

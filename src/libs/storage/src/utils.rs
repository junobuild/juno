use crate::constants::{
    ASSET_ENCODING_NO_COMPRESSION, WELL_KNOWN_CUSTOM_DOMAINS, WELL_KNOWN_II_ALTERNATIVE_ORIGINS,
};
use crate::http::types::HeaderField;
use crate::strategies::StorageAssertionsStrategy;
use crate::types::interface::AssetNoContent;
use crate::types::state::FullPath;
use crate::types::store::{Asset, AssetEncoding, AssetKey};
use candid::Principal;
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::Permission;
use junobuild_shared::list::{filter_timestamps, matcher_regex};
use junobuild_shared::types::core::Blob;
use junobuild_shared::types::list::ListParams;
use junobuild_shared::types::state::{Controllers, UserId};
use regex::Regex;

pub fn map_asset_no_content(asset: &Asset) -> (FullPath, AssetNoContent) {
    (asset.key.full_path.clone(), AssetNoContent::from(asset))
}

pub fn filter_values<'a>(
    caller: Principal,
    controllers: &'a Controllers,
    permission: &'a Permission,
    collection: CollectionKey,
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &'a ListParams,
    assets: &'a [(&'a FullPath, &'a Asset)],
    assertions: &impl StorageAssertionsStrategy,
) -> Result<Vec<(&'a FullPath, &'a Asset)>, String> {
    let (regex_key, regex_description) = matcher_regex(matcher)?;

    let result = assets
        .iter()
        .filter_map(|(key, asset)| {
            if filter_collection(collection.clone(), asset)
                && filter_full_path(&regex_key, asset)
                && filter_description(&regex_description, asset)
                && filter_owner(*owner, asset)
                && filter_timestamps(matcher, *asset)
                && assertions.assert_list_permission(
                    permission,
                    asset.key.owner,
                    caller,
                    &collection,
                    controllers,
                )
            {
                Some((*key, *asset))
            } else {
                None
            }
        })
        .collect();

    Ok(result)
}

fn filter_full_path(regex: &Option<Regex>, asset: &Asset) -> bool {
    match regex {
        None => true,
        Some(re) => re.is_match(&asset.key.full_path),
    }
}

fn filter_description(regex: &Option<Regex>, asset: &Asset) -> bool {
    match regex {
        None => true,
        Some(re) => match &asset.key.description {
            None => false,
            Some(description) => re.is_match(description),
        },
    }
}

fn filter_collection(collection: CollectionKey, asset: &Asset) -> bool {
    asset.key.collection == collection
}

fn filter_owner(filter_owner: Option<UserId>, asset: &Asset) -> bool {
    match filter_owner {
        None => true,
        Some(filter_owner) => filter_owner == asset.key.owner,
    }
}

pub fn filter_collection_values<'a>(
    collection: CollectionKey,
    assets: &'a [(&'a FullPath, &'a Asset)],
) -> Vec<(&'a FullPath, &'a Asset)> {
    assets
        .iter()
        .filter_map(|(key, asset)| {
            if filter_collection(collection.clone(), asset) {
                Some((*key, *asset))
            } else {
                None
            }
        })
        .collect()
}

pub fn get_token_protected_asset(
    asset: &Asset,
    asset_token: &String,
    token: Option<String>,
) -> Option<Asset> {
    match token {
        None => None,
        Some(token) => {
            if &token == asset_token {
                return Some(asset.clone());
            }

            None
        }
    }
}

pub fn should_include_asset_for_deletion(collection: &CollectionKey, asset_path: &String) -> bool {
    let excluded_paths = [
        WELL_KNOWN_CUSTOM_DOMAINS.to_string(),
        WELL_KNOWN_II_ALTERNATIVE_ORIGINS.to_string(),
    ];

    collection != COLLECTION_ASSET_KEY || !excluded_paths.contains(asset_path)
}

pub fn map_content_type_headers(content_type: &str) -> Vec<HeaderField> {
    vec![HeaderField(
        "content-type".to_string(),
        content_type.to_string(),
    )]
}

pub fn map_content_encoding(content: &Blob) -> AssetEncoding {
    let max_chunk_size = 1_900_000; // Max 1.9 MB per chunk
    let chunks = content
        .chunks(max_chunk_size)
        .map(|chunk| chunk.to_vec())
        .collect();

    AssetEncoding::from(&chunks)
}

pub fn create_asset_with_content(
    content: &str,
    headers: &[HeaderField],
    existing_asset: Option<Asset>,
    key: AssetKey,
) -> Asset {
    let mut asset: Asset = Asset::prepare(key, headers.to_vec(), &existing_asset);

    let encoding = map_content_encoding(&content.as_bytes().to_vec());

    asset
        .encodings
        .insert(ASSET_ENCODING_NO_COMPRESSION.to_string(), encoding);

    asset
}

pub fn clone_asset_encoding_content_chunks(encoding: &AssetEncoding, chunk_index: usize) -> Blob {
    encoding.content_chunks[chunk_index].clone()
}

use crate::list::utils::matcher_regex;
use crate::rules::assert_stores::assert_permission;
use crate::rules::types::rules::Permission;
use crate::storage::types::interface::{
    AssetEncodingNoContent, AssetNoContent, FullPathAssetNoContent,
};
use crate::storage::types::store::Asset;
use crate::types::core::CollectionKey;
use crate::types::list::ListParams;
use candid::Principal;
use regex::Regex;
use shared::types::state::{Controllers, UserId};

pub fn map_asset_no_content(asset: &Asset) -> FullPathAssetNoContent {
    (
        asset.key.full_path.clone(),
        AssetNoContent {
            key: asset.key.clone(),
            headers: asset.headers.clone(),
            encodings: asset
                .encodings
                .clone()
                .into_iter()
                .map(|(key, encoding)| {
                    (
                        key,
                        AssetEncodingNoContent {
                            modified: encoding.modified,
                            total_length: encoding.total_length,
                            sha256: encoding.sha256,
                        },
                    )
                })
                .collect(),
            created_at: asset.created_at,
            updated_at: asset.updated_at,
        },
    )
}

pub fn filter_values(
    caller: Principal,
    controllers: &Controllers,
    rule: &Permission,
    collection: CollectionKey,
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &ListParams,
    assets: &[FullPathAssetNoContent],
) -> Vec<FullPathAssetNoContent> {
    let (regex_key, regex_description) = matcher_regex(matcher);

    assets
        .iter()
        .filter_map(|(key, asset)| {
            if filter_collection(collection.clone(), asset)
                && filter_full_path(&regex_key, asset)
                && filter_description(&regex_description, asset)
                && filter_owner(*owner, asset)
                && assert_permission(rule, asset.key.owner, caller, controllers)
            {
                Some((key.clone(), asset.clone()))
            } else {
                None
            }
        })
        .collect()
}

fn filter_full_path(regex: &Option<Regex>, asset: &AssetNoContent) -> bool {
    match regex {
        None => true,
        Some(re) => re.is_match(&asset.key.full_path),
    }
}

fn filter_description(regex: &Option<Regex>, asset: &AssetNoContent) -> bool {
    match regex {
        None => true,
        Some(re) => match &asset.key.description {
            None => false,
            Some(description) => re.is_match(description),
        },
    }
}

fn filter_collection(collection: CollectionKey, asset: &AssetNoContent) -> bool {
    asset.key.collection == collection
}

fn filter_owner(filter_owner: Option<UserId>, asset: &AssetNoContent) -> bool {
    match filter_owner {
        None => true,
        Some(filter_owner) => filter_owner == asset.key.owner,
    }
}

pub fn filter_collection_values(
    collection: CollectionKey,
    assets: &[FullPathAssetNoContent],
) -> Vec<FullPathAssetNoContent> {
    assets
        .iter()
        .filter_map(|(key, asset)| {
            if filter_collection(collection.clone(), asset) {
                Some((key.clone(), asset.clone()))
            } else {
                None
            }
        })
        .collect()
}

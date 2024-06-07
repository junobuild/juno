use junobuild_shared::list::matcher_regex;
use crate::rules::assert_stores::assert_permission;
use crate::rules::types::rules::Permission;
use crate::storage::types::interface::AssetNoContent;
use crate::storage::types::state::FullPath;
use crate::storage::types::store::Asset;
use junobuild_shared::types::list::ListParams;
use candid::Principal;
use junobuild_shared::types::core::CollectionKey;
use junobuild_shared::types::state::{Controllers, UserId};
use regex::Regex;

pub fn map_asset_no_content(asset: &Asset) -> (FullPath, AssetNoContent) {
    (asset.key.full_path.clone(), AssetNoContent::from(asset))
}

pub fn filter_values<'a>(
    caller: Principal,
    controllers: &'a Controllers,
    rule: &'a Permission,
    collection: CollectionKey,
    ListParams {
        matcher,
        order: _,
        paginate: _,
        owner,
    }: &'a ListParams,
    assets: &'a [(&'a FullPath, &'a Asset)],
) -> Vec<(&'a FullPath, &'a Asset)> {
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
                Some((*key, *asset))
            } else {
                None
            }
        })
        .collect()
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

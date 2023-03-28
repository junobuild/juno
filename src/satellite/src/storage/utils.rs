use crate::rules::types::rules::Permission;
use crate::rules::utils::assert_rule;
use crate::storage::types::interface::{AssetEncodingNoContent, AssetNoContent};
use crate::storage::types::state::{Assets, FullPath};
use crate::storage::types::store::Asset;
use crate::types::core::CollectionKey;
use crate::types::list::ListParams;
use candid::Principal;
use shared::types::state::{Controllers, UserId};

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
    assets: &Assets,
) -> Vec<(FullPath, AssetNoContent)> {
    fn map_key(asset: &Asset) -> (FullPath, AssetNoContent) {
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

    let all_keys = assets.values().map(map_key);

    // TODO: matcher fullPath

    all_keys
        .into_iter()
        .filter(|(_, asset)| {
            asset_collection(collection.clone(), &asset)
                && filter_owner(owner.clone(), &asset)
                && assert_rule(rule, asset.key.owner, caller, controllers)
        })
        .collect()
}

fn asset_collection(collection: CollectionKey, asset: &AssetNoContent) -> bool {
    asset.key.collection == collection
}

fn filter_owner(filter_owner: Option<UserId>, asset: &AssetNoContent) -> bool {
    match filter_owner {
        None => true,
        Some(filter_owner) => filter_owner == asset.key.owner,
    }
}

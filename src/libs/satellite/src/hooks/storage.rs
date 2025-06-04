#![allow(dead_code)]

use crate::cdn::constants::CDN_JUNO_RELEASES_COLLECTION_KEY;
use crate::types::hooks::{
    AssertDeleteAssetContext, AssertUploadAssetContext, OnDeleteAssetContext,
    OnDeleteFilteredAssetsContext, OnDeleteManyAssetsContext, OnUploadAssetContext,
};
#[allow(unused)]
use ic_cdk_timers::set_timer;
use junobuild_collections::constants::assets::COLLECTION_ASSET_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use junobuild_storage::types::store::{Asset, AssetAssertUpload};
#[allow(unused)]
use std::time::Duration;

extern "Rust" {
    fn juno_on_upload_asset(context: OnUploadAssetContext);
    fn juno_on_delete_asset(context: OnDeleteAssetContext);
    fn juno_on_delete_many_assets(context: OnDeleteManyAssetsContext);
    fn juno_on_delete_filtered_assets(context: OnDeleteFilteredAssetsContext);

    fn juno_on_upload_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_many_assets_collections() -> Option<Vec<String>>;
    fn juno_on_delete_filtered_assets_collections() -> Option<Vec<String>>;

    fn juno_assert_upload_asset(context: AssertUploadAssetContext) -> Result<(), String>;
    fn juno_assert_delete_asset(context: AssertDeleteAssetContext) -> Result<(), String>;

    fn juno_assert_upload_asset_collections() -> Option<Vec<String>>;
    fn juno_assert_delete_asset_collections() -> Option<Vec<String>>;
}

#[allow(unused_variables)]
pub fn invoke_upload_asset(caller: &UserId, asset: &Asset) {
    #[cfg(feature = "on_upload_asset")]
    {
        // We perform this check here for performance reason given that this callback might be called when the developer deploys their frontend dapps
        if is_system_collection(&asset.key.collection) {
            return;
        }

        let context: OnUploadAssetContext = OnUploadAssetContext {
            caller: *caller,
            data: asset.clone(),
        };

        unsafe {
            let collections = juno_on_upload_asset_collections();

            if should_invoke_asset_hook(collections, &context.data.key.collection) {
                set_timer(Duration::ZERO, || {
                    juno_on_upload_asset(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_asset(caller: &UserId, asset: &Option<Asset>) {
    #[cfg(feature = "on_delete_asset")]
    {
        // We perform this check here for performance reason in case this hook gets ever called when the developer deletes any assets of the dapps
        if let Some(asset) = asset {
            if is_system_collection(&asset.key.collection) {
                return;
            }
        }

        unsafe {
            let collections = juno_on_delete_asset_collections();

            let filtered_assets = filter_assets(&collections, &[asset.clone()]);

            if !filtered_assets.is_empty() {
                let context: OnDeleteAssetContext = OnDeleteAssetContext {
                    caller: *caller,
                    data: asset.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_delete_asset(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_many_assets(caller: &UserId, assets: &[Option<Asset>]) {
    #[cfg(feature = "on_delete_many_assets")]
    {
        unsafe {
            let collections = juno_on_delete_many_assets_collections();

            let filtered_assets = filter_assets(&collections, assets);

            if !filtered_assets.is_empty() {
                let context: OnDeleteManyAssetsContext = OnDeleteManyAssetsContext {
                    caller: *caller,
                    data: filtered_assets.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_delete_many_assets(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_filtered_assets(caller: &UserId, assets: &[Option<Asset>]) {
    #[cfg(feature = "on_delete_filtered_assets")]
    {
        unsafe {
            let collections = juno_on_delete_filtered_assets_collections();

            let filtered_assets = filter_assets(&collections, assets);

            if !filtered_assets.is_empty() {
                let context: OnDeleteFilteredAssetsContext = OnDeleteFilteredAssetsContext {
                    caller: *caller,
                    data: filtered_assets.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_delete_filtered_assets(context);
                });
            }
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_assert_upload_asset(
    caller: &UserId,
    asset: &AssetAssertUpload,
) -> Result<(), String> {
    #[cfg(feature = "assert_upload_asset")]
    {
        // We perform this check here for performance reason given that this callback might be called when the developer deploys their frontend dapps
        if is_system_collection(&asset.batch.key.collection) {
            return Ok(());
        }

        let context: AssertUploadAssetContext = AssertUploadAssetContext {
            caller: *caller,
            data: asset.clone(),
        };

        unsafe {
            let collections = juno_assert_upload_asset_collections();

            if should_invoke_asset_hook(collections, &context.data.batch.key.collection) {
                return juno_assert_upload_asset(context);
            }
        }
    }

    Ok(())
}

#[allow(dead_code, unused_variables)]
pub fn invoke_assert_delete_asset(caller: &UserId, asset: &Asset) -> Result<(), String> {
    #[cfg(feature = "assert_delete_asset")]
    {
        // We perform this check here for performance reason in case this hook gets ever called when the developer deletes any assets of the dapps
        if is_system_collection(&asset.key.collection) {
            return Ok(());
        }

        let context: AssertDeleteAssetContext = AssertDeleteAssetContext {
            caller: *caller,
            data: asset.clone(),
        };

        unsafe {
            let collections = juno_assert_delete_asset_collections();

            if should_invoke_asset_hook(collections, &context.data.key.collection) {
                return juno_assert_delete_asset(context);
            }
        }
    }

    Ok(())
}

#[allow(clippy::unnecessary_map_or)]
fn should_invoke_asset_hook(collections: Option<Vec<String>>, collection: &CollectionKey) -> bool {
    is_not_system_collection(collection) && collections.map_or(true, |c| c.contains(collection))
}

#[allow(clippy::unnecessary_map_or)]
fn filter_assets(
    collections: &Option<Vec<String>>,
    assets: &[Option<Asset>],
) -> Vec<Option<Asset>> {
    assets
        .iter()
        .filter(|asset| match asset {
            None => false,
            Some(asset) => {
                is_not_system_collection(&asset.key.collection)
                    && collections.as_ref().map_or(true, |cols| {
                        cols.contains(&asset.key.collection.to_string())
                    })
            }
        })
        .cloned() // Clone each matching DocContext
        .collect()
}

// We skip system collections for performance reason given that the hook might be called when the developer deploys their frontend dapps or update their serverless functions.
fn is_system_collection(collection: &CollectionKey) -> bool {
    collection == COLLECTION_ASSET_KEY || collection == CDN_JUNO_RELEASES_COLLECTION_KEY
}

fn is_not_system_collection(collection: &CollectionKey) -> bool {
    !is_system_collection(collection)
}

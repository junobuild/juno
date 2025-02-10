#![allow(dead_code)]

use crate::db::types::state::{Doc, DocAssertDelete, DocAssertSet, DocContext, DocUpsert};
use crate::types::hooks::{
    AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, OnDeleteAssetContext, OnDeleteDocContext,
    OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use crate::HookContext;
#[allow(unused)]
use ic_cdk_timers::set_timer;
use junobuild_collections::constants::{COLLECTION_ASSET_KEY, COLLECTION_LOG_KEY};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
use junobuild_storage::types::store::{Asset, AssetAssertUpload};
#[allow(unused)]
use std::time::Duration;

extern "Rust" {
    fn juno_on_set_doc(context: OnSetDocContext);
    fn juno_on_set_many_docs(context: OnSetManyDocsContext);
    fn juno_on_delete_doc(context: OnDeleteDocContext);
    fn juno_on_delete_many_docs(context: OnDeleteManyDocsContext);
    fn juno_on_delete_filtered_docs(context: OnDeleteFilteredDocsContext);

    fn juno_on_set_doc_collections() -> Option<Vec<String>>;
    fn juno_on_set_many_docs_collections() -> Option<Vec<String>>;
    fn juno_on_delete_doc_collections() -> Option<Vec<String>>;
    fn juno_on_delete_many_docs_collections() -> Option<Vec<String>>;
    fn juno_on_delete_filtered_docs_collections() -> Option<Vec<String>>;

    fn juno_on_upload_asset(context: OnUploadAssetContext);
    fn juno_on_delete_asset(context: OnDeleteAssetContext);
    fn juno_on_delete_many_assets(context: OnDeleteManyAssetsContext);
    fn juno_on_delete_filtered_assets(context: OnDeleteFilteredAssetsContext);

    fn juno_on_upload_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_many_assets_collections() -> Option<Vec<String>>;
    fn juno_on_delete_filtered_assets_collections() -> Option<Vec<String>>;

    fn juno_assert_set_doc(context: AssertSetDocContext) -> Result<(), String>;
    fn juno_assert_delete_doc(context: AssertDeleteDocContext) -> Result<(), String>;

    fn juno_assert_set_doc_collections() -> Option<Vec<String>>;
    fn juno_assert_delete_doc_collections() -> Option<Vec<String>>;

    fn juno_assert_upload_asset(context: AssertUploadAssetContext) -> Result<(), String>;
    fn juno_assert_delete_asset(context: AssertDeleteAssetContext) -> Result<(), String>;

    fn juno_assert_upload_asset_collections() -> Option<Vec<String>>;
    fn juno_assert_delete_asset_collections() -> Option<Vec<String>>;

    fn juno_on_init();
    fn juno_on_post_upgrade();
}

#[allow(unused_variables)]
pub fn invoke_on_set_doc(caller: &UserId, doc: &DocContext<DocUpsert>) {
    #[cfg(feature = "on_set_doc")]
    {
        let context: OnSetDocContext = OnSetDocContext {
            caller: *caller,
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_on_set_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                set_timer(Duration::ZERO, || {
                    juno_on_set_doc(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_set_many_docs(caller: &UserId, docs: &[DocContext<DocUpsert>]) {
    #[cfg(feature = "on_set_many_docs")]
    {
        unsafe {
            let collections = juno_on_set_many_docs_collections();

            let filtered_docs = filter_docs(&collections, docs);

            if !filtered_docs.is_empty() {
                let context: OnSetManyDocsContext = OnSetManyDocsContext {
                    caller: *caller,
                    data: filtered_docs.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_set_many_docs(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_doc(caller: &UserId, doc: &DocContext<Option<Doc>>) {
    #[cfg(feature = "on_delete_doc")]
    {
        let context: OnDeleteDocContext = OnDeleteDocContext {
            caller: *caller,
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_on_delete_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                set_timer(Duration::ZERO, || {
                    juno_on_delete_doc(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_many_docs(caller: &UserId, docs: &[DocContext<Option<Doc>>]) {
    #[cfg(feature = "on_delete_many_docs")]
    {
        unsafe {
            let collections = juno_on_delete_many_docs_collections();

            let filtered_docs = filter_docs(&collections, docs);

            if !filtered_docs.is_empty() {
                let context: OnDeleteManyDocsContext = OnDeleteManyDocsContext {
                    caller: *caller,
                    data: filtered_docs.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_delete_many_docs(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_filtered_docs(caller: &UserId, docs: &[DocContext<Option<Doc>>]) {
    #[cfg(feature = "on_delete_filtered_docs")]
    {
        unsafe {
            let collections = juno_on_delete_filtered_docs_collections();

            let filtered_docs = filter_docs(&collections, docs);

            if !filtered_docs.is_empty() {
                let context: OnDeleteFilteredDocsContext = OnDeleteFilteredDocsContext {
                    caller: *caller,
                    data: filtered_docs.clone(),
                };

                set_timer(Duration::ZERO, || {
                    juno_on_delete_filtered_docs(context);
                });
            }
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_upload_asset(caller: &UserId, asset: &Asset) {
    #[cfg(feature = "on_upload_asset")]
    {
        // We perform this check here for performance reason given that this callback might be called when the developer deploys their frontend dapps
        if is_asset_collection(&asset.key.collection) {
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
            if is_asset_collection(&asset.key.collection) {
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
pub fn invoke_assert_set_doc(
    caller: &UserId,
    doc: &DocContext<DocAssertSet>,
) -> Result<(), String> {
    #[cfg(feature = "assert_set_doc")]
    {
        let context: AssertSetDocContext = AssertSetDocContext {
            caller: *caller,
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_assert_set_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                return juno_assert_set_doc(context);
            }
        }
    }

    Ok(())
}

#[allow(unused_variables)]
pub fn invoke_assert_delete_doc(
    caller: &UserId,
    doc: &DocContext<DocAssertDelete>,
) -> Result<(), String> {
    #[cfg(feature = "assert_delete_doc")]
    {
        let context: AssertDeleteDocContext = AssertDeleteDocContext {
            caller: *caller,
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_assert_delete_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                return juno_assert_delete_doc(context);
            }
        }
    }

    Ok(())
}

#[allow(unused_variables)]
pub fn invoke_assert_upload_asset(
    caller: &UserId,
    asset: &AssetAssertUpload,
) -> Result<(), String> {
    #[cfg(feature = "assert_upload_asset")]
    {
        // We perform this check here for performance reason given that this callback might be called when the developer deploys their frontend dapps
        if is_asset_collection(&asset.batch.key.collection) {
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
        if is_asset_collection(&asset.key.collection) {
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

#[allow(unused_variables)]
pub fn invoke_on_init() {
    #[cfg(feature = "on_init")]
    {
        unsafe {
            set_timer(Duration::ZERO, || {
                juno_on_init();
            });
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_on_post_upgrade() {
    #[cfg(feature = "on_post_upgrade")]
    {
        unsafe {
            set_timer(Duration::ZERO, || {
                juno_on_post_upgrade();
            });
        }
    }
}

fn should_invoke_doc_hook<T>(
    collections: Option<Vec<String>>,
    context: &HookContext<DocContext<T>>,
) -> bool {
    is_not_log_collection(&context.data.collection)
        && collections.map_or(true, |c| c.contains(&context.data.collection))
}

fn filter_docs<T: Clone>(
    collections: &Option<Vec<String>>,
    docs: &[DocContext<T>],
) -> Vec<DocContext<T>> {
    docs.iter()
        .filter(|d| {
            is_not_log_collection(&d.collection.to_string())
                && collections
                    .as_ref()
                    .map_or(true, |cols| cols.contains(&d.collection.to_string()))
        })
        .cloned() // Clone each matching DocContext
        .collect()
}

// Logs are set internally without calling hooks anyway, so this use case cannot happen at the time I wrote these lines, but I added those to prevent any unwanted issues in the future.
fn is_log_collection(collection: &CollectionKey) -> bool {
    collection == COLLECTION_LOG_KEY
}

fn is_not_log_collection(collection: &CollectionKey) -> bool {
    !is_log_collection(collection)
}

fn should_invoke_asset_hook(collections: Option<Vec<String>>, collection: &CollectionKey) -> bool {
    is_not_asset_collection(collection) && collections.map_or(true, |c| c.contains(collection))
}

fn filter_assets(
    collections: &Option<Vec<String>>,
    assets: &[Option<Asset>],
) -> Vec<Option<Asset>> {
    assets
        .iter()
        .filter(|asset| match asset {
            None => false,
            Some(asset) => {
                is_not_asset_collection(&asset.key.collection)
                    && collections.as_ref().map_or(true, |cols| {
                        cols.contains(&asset.key.collection.to_string())
                    })
            }
        })
        .cloned() // Clone each matching DocContext
        .collect()
}

fn is_asset_collection(collection: &CollectionKey) -> bool {
    collection == COLLECTION_ASSET_KEY
}

fn is_not_asset_collection(collection: &CollectionKey) -> bool {
    !is_asset_collection(collection)
}

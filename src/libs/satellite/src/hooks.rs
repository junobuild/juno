#![allow(dead_code)]

use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::rules::constants::ASSET_COLLECTION_KEY;
use crate::storage::types::store::Asset;
use crate::types::hooks::{
    OnDeleteAssetContext, OnDeleteDocContext, OnDeleteManyAssetsContext, OnDeleteManyDocsContext,
    OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use crate::{CollectionKey, HookContext};
#[allow(unused)]
use ic_cdk_timers::set_timer;
use shared::types::state::UserId;
#[allow(unused)]
use std::time::Duration;

extern "Rust" {
    fn juno_on_set_doc(context: OnSetDocContext);
    fn juno_on_set_many_docs(context: OnSetManyDocsContext);
    fn juno_on_delete_doc(context: OnDeleteDocContext);
    fn juno_on_delete_many_docs(context: OnDeleteManyDocsContext);

    fn juno_on_set_doc_collections() -> Option<Vec<String>>;
    fn juno_on_set_many_docs_collections() -> Option<Vec<String>>;
    fn juno_on_delete_doc_collections() -> Option<Vec<String>>;
    fn juno_on_delete_many_docs_collections() -> Option<Vec<String>>;

    fn juno_on_upload_asset(context: OnUploadAssetContext);
    fn juno_on_delete_asset(context: OnDeleteAssetContext);
    fn juno_on_delete_many_assets(context: OnDeleteManyAssetsContext);

    fn juno_on_upload_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_asset_collections() -> Option<Vec<String>>;
    fn juno_on_delete_many_assets_collections() -> Option<Vec<String>>;
}

#[allow(unused_variables)]
pub fn invoke_on_set_doc(caller: &UserId, doc: &DocContext<DocUpsert>) {
    #[cfg(not(feature = "disable_on_set_doc"))]
    {
        let context: OnSetDocContext = OnSetDocContext {
            caller: caller.clone(),
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_on_set_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_set_doc(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_set_many_docs(caller: &UserId, docs: &[DocContext<DocUpsert>]) {
    #[cfg(not(feature = "disable_on_set_many_docs"))]
    {
        unsafe {
            let collections = juno_on_set_many_docs_collections();

            let filtered_docs = filter_docs(&collections, docs);

            if filtered_docs.len() > 0 {
                let context: OnSetManyDocsContext = OnSetManyDocsContext {
                    caller: caller.clone(),
                    data: filtered_docs.clone(),
                };

                set_timer(Duration::from_nanos(0), || {
                    juno_on_set_many_docs(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_doc(caller: &UserId, doc: &DocContext<Option<Doc>>) {
    #[cfg(not(feature = "disable_on_delete_doc"))]
    {
        let context: OnDeleteDocContext = OnDeleteDocContext {
            caller: caller.clone(),
            data: doc.clone(),
        };

        unsafe {
            let collections = juno_on_delete_doc_collections();

            if should_invoke_doc_hook(collections, &context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_delete_doc(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_many_docs(caller: &UserId, docs: &[DocContext<Option<Doc>>]) {
    #[cfg(not(feature = "disable_on_delete_many_docs"))]
    {
        unsafe {
            let collections = juno_on_delete_many_docs_collections();

            let filtered_docs = filter_docs(&collections, docs);

            if filtered_docs.len() > 0 {
                let context: OnDeleteManyDocsContext = OnDeleteManyDocsContext {
                    caller: caller.clone(),
                    data: filtered_docs.clone(),
                };

                set_timer(Duration::from_nanos(0), || {
                    juno_on_delete_many_docs(context);
                });
            }
        }
    }
}

#[allow(unused_variables)]
pub fn invoke_upload_asset(caller: &UserId, asset: &Asset) {
    #[cfg(not(feature = "disable_on_upload_asset"))]
    {
        // We perform this check here for performance reason given that this callback might be called when the developer deploys their frontend dapps
        if is_not_asset_collection(&asset.key.collection) {
            return;
        }

        let context: OnUploadAssetContext = OnUploadAssetContext {
            caller: caller.clone(),
            data: asset.clone(),
        };

        unsafe {
            let collections = juno_on_upload_asset_collections();

            if should_invoke_asset_hook(collections, &context) {
                set_timer(Duration::from_nanos(0), || {
                    juno_on_upload_asset(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_asset(caller: &UserId, asset: &Option<Asset>) {
    #[cfg(not(feature = "disable_on_delete_asset"))]
    {
        unsafe {
            let collections = juno_on_delete_asset_collections();

            let filtered_assets = filter_assets(&collections, &vec![asset.clone()]);

            if filtered_assets.len() > 0 {
                let context: OnDeleteAssetContext = OnDeleteAssetContext {
                    caller: caller.clone(),
                    data: asset.clone(),
                };

                set_timer(Duration::from_nanos(0), || {
                    juno_on_delete_asset(context);
                });
            }
        }
    }
}

#[allow(dead_code, unused_variables)]
pub fn invoke_on_delete_many_assets(caller: &UserId, assets: &[Option<Asset>]) {
    #[cfg(not(feature = "disable_on_delete_many_assets"))]
    {
        unsafe {
            let collections = juno_on_delete_many_assets_collections();

            let filtered_assets = filter_assets(&collections, assets);

            if filtered_assets.len() > 0 {
                let context: OnDeleteManyAssetsContext = OnDeleteManyAssetsContext {
                    caller: caller.clone(),
                    data: filtered_assets.clone(),
                };

                set_timer(Duration::from_nanos(0), || {
                    juno_on_delete_many_assets(context);
                });
            }
        }
    }
}

fn should_invoke_doc_hook<T>(
    collections: Option<Vec<String>>,
    context: &HookContext<DocContext<T>>,
) -> bool {
    collections.map_or(true, |c| c.contains(&context.data.collection))
}

fn filter_docs<T: Clone>(
    collections: &Option<Vec<String>>,
    docs: &[DocContext<T>],
) -> Vec<DocContext<T>> {
    docs.iter()
        .filter(|d| {
            collections
                .as_ref()
                .map_or(true, |cols| cols.contains(&d.collection.to_string()))
        })
        .cloned() // Clone each matching DocContext
        .collect()
}

fn should_invoke_asset_hook(
    collections: Option<Vec<String>>,
    context: &HookContext<Asset>,
) -> bool {
    is_not_asset_collection(&context.data.key.collection)
        && collections.map_or(true, |c| c.contains(&context.data.key.collection))
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

fn is_not_asset_collection(collection: &CollectionKey) -> bool {
    collection != ASSET_COLLECTION_KEY
}

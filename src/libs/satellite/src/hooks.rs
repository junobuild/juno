#![allow(dead_code)]

use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::types::hooks::{OnDeleteDocContext, OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext};
use crate::HookContext;
#[allow(unused)]
use ic_cdk_timers::set_timer;
use shared::types::state::UserId;
#[allow(unused)]
use std::time::Duration;
use crate::storage::types::store::Asset;

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

    fn juno_on_upload_asset_collections() -> Option<Vec<String>>;
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
    collections.map_or(true, |c| c.contains(&context.data.key.collection))
}
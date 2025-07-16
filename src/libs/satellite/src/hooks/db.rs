#![allow(dead_code)]

use crate::db::types::state::{Doc, DocAssertDelete, DocAssertSet, DocContext, DocUpsert};
use crate::types::hooks::{
    AssertDeleteDocContext, AssertSetDocContext, OnDeleteDocContext, OnDeleteFilteredDocsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext,
};
use crate::HookContext;
#[allow(unused)]
use ic_cdk_timers::set_timer;
use junobuild_collections::constants::db::COLLECTION_LOG_KEY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;
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

    fn juno_assert_set_doc(context: AssertSetDocContext) -> Result<(), String>;
    fn juno_assert_delete_doc(context: AssertDeleteDocContext) -> Result<(), String>;

    fn juno_assert_set_doc_collections() -> Option<Vec<String>>;
    fn juno_assert_delete_doc_collections() -> Option<Vec<String>>;
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

#[allow(clippy::unnecessary_map_or)]
fn should_invoke_doc_hook<T>(
    collections: Option<Vec<String>>,
    context: &HookContext<DocContext<T>>,
) -> bool {
    is_not_log_collection(&context.data.collection)
        && collections.map_or(true, |c| c.contains(&context.data.collection))
}

#[allow(clippy::unnecessary_map_or)]
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

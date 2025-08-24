use crate::hooks::db::{
    invoke_on_delete_doc, invoke_on_delete_filtered_docs, invoke_on_delete_many_docs,
    invoke_on_set_doc, invoke_on_set_many_docs,
};
use crate::user::internal_hooks::{on_delete_many_users, on_delete_user};
use crate::{
    caller, count_collection_docs_store, count_docs_store, delete_doc_store, delete_docs_store,
    delete_filtered_docs_store, get_doc_store, list_docs_store, set_doc_store, DelDoc, Doc,
    DocContext, DocUpsert, SetDoc,
};
use ic_cdk::trap;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::core::Key;
use junobuild_shared::types::list::{ListParams, ListResults};

pub fn set_doc(collection: CollectionKey, key: Key, doc: SetDoc) -> Doc {
    let caller = caller();

    let result = set_doc_store(caller, collection, key, doc);

    match result {
        Ok(doc) => {
            invoke_on_set_doc(&caller, &doc);

            doc.data.after
        }
        Err(error) => trap(&error),
    }
}

pub fn get_doc(collection: CollectionKey, key: Key) -> Option<Doc> {
    let caller = caller();

    let result = get_doc_store(caller, collection, key);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn del_doc(collection: CollectionKey, key: Key, doc: DelDoc) {
    let caller = caller();

    let deleted_doc = delete_doc_store(caller, collection, key, doc).unwrap_or_else(|e| trap(&e));

    on_delete_user(&deleted_doc).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_doc(&caller, &deleted_doc);
}

pub fn list_docs(collection: CollectionKey, filter: ListParams) -> ListResults<Doc> {
    let caller = caller();

    let result = list_docs_store(caller, collection, &filter);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn count_docs(collection: CollectionKey, filter: ListParams) -> usize {
    let caller = caller();

    let result = count_docs_store(caller, collection, &filter);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

pub fn get_many_docs(docs: Vec<(CollectionKey, Key)>) -> Vec<(Key, Option<Doc>)> {
    docs.iter()
        .map(|(collection, key)| {
            let doc = get_doc(collection.clone(), key.clone());
            (key.clone(), doc.clone())
        })
        .collect()
}

pub fn set_many_docs(docs: Vec<(CollectionKey, Key, SetDoc)>) -> Vec<(Key, Doc)> {
    let caller = caller();

    let mut hook_payload: Vec<DocContext<DocUpsert>> = Vec::new();
    let mut results: Vec<(Key, Doc)> = Vec::new();

    for (collection, key, doc) in docs {
        let result =
            set_doc_store(caller, collection, key.clone(), doc).unwrap_or_else(|e| trap(&e));

        results.push((result.key.clone(), result.data.after.clone()));

        hook_payload.push(result);
    }

    invoke_on_set_many_docs(&caller, &hook_payload);

    results
}

pub fn del_many_docs(docs: Vec<(CollectionKey, Key, DelDoc)>) {
    let caller = caller();

    let mut results: Vec<DocContext<Option<Doc>>> = Vec::new();

    for (collection, key, doc) in docs {
        let deleted_doc =
            delete_doc_store(caller, collection, key.clone(), doc).unwrap_or_else(|e| trap(&e));
        results.push(deleted_doc);
    }

    on_delete_many_users(&results).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_many_docs(&caller, &results);
}

pub fn del_filtered_docs(collection: CollectionKey, filter: ListParams) {
    let caller = caller();

    let results =
        delete_filtered_docs_store(caller, collection, &filter).unwrap_or_else(|e| trap(&e));

    invoke_on_delete_filtered_docs(&caller, &results);
}

pub fn del_docs(collection: CollectionKey) {
    delete_docs_store(&collection).unwrap_or_else(|e| trap(&e));
}

pub fn count_collection_docs(collection: CollectionKey) -> usize {
    let result = count_collection_docs_store(&collection);

    match result {
        Ok(value) => value,
        Err(error) => trap(&error),
    }
}

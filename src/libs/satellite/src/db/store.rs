use crate::auth::store::get_config as get_auth_config;
use crate::controllers::store::get_controllers;
use crate::db::assert::{
    assert_delete_doc, assert_get_doc, assert_get_docs, assert_set_config, assert_set_doc,
};
use crate::db::state::{
    count_docs_heap, count_docs_stable, delete_collection as delete_state_collection,
    delete_doc as delete_state_doc, get_config, get_doc as get_state_doc, get_docs_heap,
    get_docs_stable, get_rule as get_state_rule, init_collection as init_state_collection,
    insert_config, insert_doc as insert_state_doc,
    is_collection_empty as is_state_collection_empty,
};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::{DelDoc, SetDbConfig, SetDoc};
use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::db::utils::filter_values;
use crate::memory::state::STATE;
use crate::types::store::{AssertContext, StoreContext};
use candid::Principal;
use junobuild_collections::msg::msg_db_collection_not_empty;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_shared::list::list_values;
use junobuild_shared::types::core::Key;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::{Controllers, UserId};

// ---------------------------------------------------------
// Collection
// ---------------------------------------------------------

pub fn init_collection_store(collection: &CollectionKey, memory: &Memory) {
    init_state_collection(collection, memory);
}

pub fn delete_collection_store(collection: &CollectionKey) -> Result<(), String> {
    secure_delete_collection(collection)
}

fn secure_delete_collection(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;
    delete_collection_impl(collection, &rule.memory)
}

fn delete_collection_impl(
    collection: &CollectionKey,
    memory: &Option<Memory>,
) -> Result<(), String> {
    let empty = is_state_collection_empty(collection, memory)?;

    if !empty {
        return Err(msg_db_collection_not_empty(collection));
    }

    delete_state_collection(collection, memory)?;

    Ok(())
}

// ---------------------------------------------------------
// Get
// ---------------------------------------------------------

/// Get a document from a collection's store.
///
/// This function retrieves a document from a collection's store based on the specified parameters.
/// It returns a `Result<Option<Doc>, String>` where `Ok(Some(Doc))` indicates a successfully retrieved
/// document, `Ok(None)` represents no document found, or an error message as `Err(String)` if retrieval
/// encounters issues.
///
/// # Parameters
/// - `caller`: The `UserId` representing the caller requesting the document.
/// - `collection`: A `CollectionKey` representing the collection from which to retrieve the document.
/// - `key`: A `Key` identifying the document to be retrieved.
///
/// # Returns
/// - `Ok(Some(Doc))`: Indicates successful retrieval of a document.
/// - `Ok(None)`: Indicates no document found for the specified key.
/// - `Err(String)`: An error message if retrieval fails.
///
/// This function allows you to securely retrieve a document from a Juno collection's store.
pub fn get_doc_store(
    caller: UserId,
    collection: CollectionKey,
    key: Key,
) -> Result<Option<Doc>, String> {
    let controllers: Controllers = get_controllers();

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection: &collection,
    };

    secure_get_doc(&context, key)
}

fn secure_get_doc(context: &StoreContext, key: Key) -> Result<Option<Doc>, String> {
    let rule = get_state_rule(context.collection)?;
    let auth_config = get_auth_config();

    let assert_context = AssertContext {
        rule: &rule,
        auth_config: &auth_config,
    };

    get_doc_impl(context, &assert_context, key)
}

fn get_doc_impl(
    context: &StoreContext,
    assert_context: &AssertContext,
    key: Key,
) -> Result<Option<Doc>, String> {
    let value = get_state_doc(context.collection, &key, assert_context.rule)?;

    match value {
        None => Ok(None),
        Some(value) => {
            if assert_get_doc(context, assert_context, &value).is_err() {
                return Ok(None);
            }

            Ok(Some(value))
        }
    }
}

// ---------------------------------------------------------
// Insert
// ---------------------------------------------------------

/// Set a document in a collection's store.
///
/// This function sets a document in a collection's store based on the specified parameters.
/// It returns a `Result<DocContext<DocUpsert>, String>` where `Ok(DocContext)` indicates successful
/// insertion or update of the document, or an error message as `Err(String)` if the operation encounters
/// issues.
///
/// # Parameters
/// - `caller`: The `UserId` representing the caller initiating the operation.
/// - `collection`: A `CollectionKey` representing the collection in which to set the document.
/// - `key`: A `Key` identifying the document to be set.
/// - `value`: An instance of `SetDoc` representing the document to be inserted or updated.
///
/// # Returns
/// - `Ok(DocContext<DocUpsert>)`: Indicates successful insertion or update of the document.
/// - `Err(String)`: An error message if the operation fails.
///
/// This function allows you to securely insert or update documents in a Juno collection's store.
pub fn set_doc_store(
    caller: UserId,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
) -> Result<DocContext<DocUpsert>, String> {
    let controllers: Controllers = get_controllers();
    let config = get_config();

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection: &collection,
    };

    let data = secure_set_doc(&context, &config, key.clone(), value)?;

    Ok(DocContext {
        key,
        collection,
        data,
    })
}

fn secure_set_doc(
    context: &StoreContext,
    config: &Option<DbConfig>,
    key: Key,
    value: SetDoc,
) -> Result<DocUpsert, String> {
    let rule = get_state_rule(context.collection)?;
    let auth_config = get_auth_config();

    let assert_context = AssertContext {
        rule: &rule,
        auth_config: &auth_config,
    };

    set_doc_impl(context, &assert_context, config, key, value)
}

fn set_doc_impl(
    context: &StoreContext,
    assert_context: &AssertContext,
    config: &Option<DbConfig>,
    key: Key,
    value: SetDoc,
) -> Result<DocUpsert, String> {
    let current_doc = get_state_doc(context.collection, &key, assert_context.rule)?;

    assert_set_doc(context, assert_context, config, &key, &value, &current_doc)?;

    let doc: Doc = Doc::prepare(context.caller, &current_doc, value);

    let (_evicted_doc, after) =
        insert_state_doc(context.collection, &key, &doc, assert_context.rule)?;

    Ok(DocUpsert {
        before: current_doc,
        after,
    })
}

// ---------------------------------------------------------
// List
// ---------------------------------------------------------

/// List documents in a collection.
///
/// This function retrieves a list of documents from a collection's store based on the specified parameters.
/// It returns a `Result<ListResults<Doc>, String>` where `Ok(ListResults)` contains the retrieved documents,
/// or an error message as `Err(String)` if the operation encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the operation. If used in serverless functions, you can use `junobuild_satellite::id()` to pass an administrator controller.
/// - `collection`: A `CollectionKey` representing the collection from which to list the documents.
/// - `filter`: A reference to `ListParams` containing the filter criteria for listing the documents.
///
/// # Returns
/// - `Ok(ListResults<Doc>)`: Contains the list of retrieved documents matching the filter criteria.
/// - `Err(String)`: An error message if the operation fails.
///
/// This function retrieves documents from a Juno collection's store, applying the specified filter criteria.
pub fn list_docs_store(
    caller: Principal,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<ListResults<Doc>, String> {
    let controllers: Controllers = get_controllers();

    secure_get_docs(caller, &controllers, collection, filter)
}

/// Count documents in a collection.
///
/// This function retrieves the count of documents from a collection's store based on the specified parameters.
/// It returns a `Result<usize, String>` where `Ok(usize)` contains the count of documents matching the filter criteria,
/// or an error message as `Err(String)` if the operation encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the operation. If used in serverless functions, you can use `junobuild_satellite::id()` to pass an administrator controller.
/// - `collection`: A `CollectionKey` representing the collection from which to count the documents.
/// - `filter`: A reference to `ListParams` containing the filter criteria for counting the documents.
///
/// # Returns
/// - `Ok(usize)`: Contains the count of documents matching the filter criteria.
/// - `Err(String)`: An error message if the operation fails.
///
/// This function counts documents in a Juno collection's store by listing them and then determining the length of the result set.
///
/// # Note
/// This implementation can be improved, as it currently relies on `list_docs_store` underneath, meaning that all documents matching the filter criteria are still read from the store. This might lead to unnecessary overhead, especially for large collections. Optimizing this function to count documents directly without retrieving them could enhance performance.
pub fn count_docs_store(
    caller: Principal,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<usize, String> {
    let results = list_docs_store(caller, collection, filter)?;
    Ok(results.items_length)
}

fn secure_get_docs(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<ListResults<Doc>, String> {
    let context: StoreContext = StoreContext {
        caller,
        collection: &collection,
        controllers,
    };

    let rule = get_state_rule(&collection)?;
    let auth_config = get_auth_config();

    let assert_context = AssertContext {
        rule: &rule,
        auth_config: &auth_config,
    };

    assert_get_docs(&context, &assert_context)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let docs = get_docs_heap(&collection, &state_ref.heap.db.db)?;
            get_docs_impl(&docs, caller, controllers, filter, &rule)
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_docs_stable(&collection, &state.borrow().stable.db)?;
            let docs: Vec<(&Key, &Doc)> = stable.iter().map(|(key, doc)| (&key.key, doc)).collect();
            get_docs_impl(&docs, caller, controllers, filter, &rule)
        }),
    }
}

fn get_docs_impl<'a>(
    docs: &[(&'a Key, &'a Doc)],
    caller: Principal,
    controllers: &Controllers,
    filters: &ListParams,
    rule: &Rule,
) -> Result<ListResults<Doc>, String> {
    let matches = filter_values(caller, controllers, &rule.read, docs, filters)?;

    let results = list_values(&matches, filters);

    Ok(results)
}

// ---------------------------------------------------------
// Delete
// ---------------------------------------------------------

/// Delete a document from a collection's store.
///
/// This function deletes a document from a collection's store based on the specified parameters.
/// It returns a `Result` with `Ok(DocContext<Option<Doc>>)` on success, containing information
/// about the deleted document, or an error message as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `caller`: The `UserId` representing the caller initiating the deletion.
/// - `collection`: A `CollectionKey` representing the collection from which to delete the document.
/// - `key`: A `Key` identifying the document to be deleted.
/// - `value`: An instance of `DelDoc` representing the deletion action.
///
/// # Returns
/// - `Ok(DocContext<Option<Doc>>)`:
///   - `key`: The `Key` of the deleted document.
///   - `collection`: The `CollectionKey` from which the document was deleted.
///   - `data`: An `Option<Doc>` representing the deleted document data, if available.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function allows you to securely delete documents from a Juno collection's store, returning
/// relevant context information or error messages.
pub fn delete_doc_store(
    caller: UserId,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
) -> Result<DocContext<Option<Doc>>, String> {
    let controllers: Controllers = get_controllers();

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection: &collection,
    };

    let doc = secure_delete_doc(&context, key.clone(), value)?;

    Ok(DocContext {
        key,
        collection,
        data: doc,
    })
}

fn secure_delete_doc(
    context: &StoreContext,
    key: Key,
    value: DelDoc,
) -> Result<Option<Doc>, String> {
    let rule = get_state_rule(context.collection)?;
    let auth_config = get_auth_config();

    let assert_context = AssertContext {
        rule: &rule,
        auth_config: &auth_config,
    };

    delete_doc_impl(context, &assert_context, key, value)
}

fn delete_doc_impl(
    context: &StoreContext,
    assert_context: &AssertContext,
    key: Key,
    value: DelDoc,
) -> Result<Option<Doc>, String> {
    let current_doc = get_state_doc(context.collection, &key, assert_context.rule)?;

    assert_delete_doc(context, assert_context, &key, &value, &current_doc)?;

    delete_state_doc(context.collection, &key, assert_context.rule)
}

/// Delete multiple documents from a collection's store.
///
/// This function deletes multiple documents from a collection's store based on the specified collection key.
/// It returns a `Result<(), String>` where `Ok(())` indicates successful deletion, or an error message
/// as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `collection`: A reference to the `CollectionKey` representing the collection from which to delete documents.
///
/// # Returns
/// - `Ok(())`: Indicates successful deletion of documents.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function allows you to securely delete multiple documents from a Juno collection's store.
pub fn delete_docs_store(collection: &CollectionKey) -> Result<(), String> {
    let rule = get_state_rule(collection)?;

    let keys = match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            get_docs_heap(collection, &state.borrow().heap.db.db)
                .map(|docs| docs.into_iter().map(|(key, _)| key.clone()).collect())
        }),
        Memory::Stable => STATE.with(|state| {
            get_docs_stable(collection, &state.borrow().stable.db)
                .map(|docs| docs.iter().map(|(key, _)| key.key.clone()).collect())
        }),
    }?;

    delete_docs_impl(&keys, collection, &rule)
}

fn delete_docs_impl(
    keys: &Vec<Key>,
    collection: &CollectionKey,
    rule: &Rule,
) -> Result<(), String> {
    for key in keys {
        delete_state_doc(collection, key, rule)?;
    }

    Ok(())
}

/// Count the number of documents in a collection's store.
///
/// This function retrieves the state rule for the specified collection and counts the documents
/// based on the memory type (Heap or Stable). It returns the count as a `Result` with `Ok(usize)`
/// on success, or an error message as `Err(String)` if an issue occurs during counting.
///
/// # Parameters
/// - `collection`: A reference to the `CollectionKey` representing the collection to count documents in.
///
/// # Returns
/// - `Ok(usize)`: The count of documents in the collection.
/// - `Err(String)`: An error message if counting fails.
///
/// This function provides a convenient way to determine the number of documents in a Juno collection's store.
pub fn count_collection_docs_store(collection: &CollectionKey) -> Result<usize, String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let length = count_docs_heap(collection, &state_ref.heap.db.db)?;
            Ok(length)
        }),
        Memory::Stable => STATE.with(|state| {
            let length = count_docs_stable(collection, &state.borrow().stable.db)?;
            Ok(length)
        }),
    }
}

/// Delete multiple documents from a collection's store based on filter criteria.
///
/// This function deletes documents from a collection's store that match the specified filter criteria.
/// It returns a `Result` with `Ok(Vec<DocContext<Option<Doc>>>)` on success, containing information
/// about each deleted document, or an error message as `Err(String)` if the deletion encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the deletion.
/// - `collection`: A `CollectionKey` representing the collection from which to delete the documents.
/// - `filter`: A reference to `ListParams`, defining the criteria to filter documents for deletion.
///
/// # Returns
/// - `Ok(Vec<DocContext<Option<Doc>>>)`:
///   - Each element in the vector represents the context of a deleted document, with:
///     - `key`: The `Key` of the deleted document.
///     - `collection`: The `CollectionKey` from which the document was deleted.
///     - `data`: An `Option<Doc>` representing the deleted document data, if available.
/// - `Err(String)`: An error message if the deletion operation fails.
///
/// This function enables batch deletion of documents in a Juno collection's store that match the given
/// filter criteria, providing context information for each deleted document or error messages.
pub fn delete_filtered_docs_store(
    caller: Principal,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<Vec<DocContext<Option<Doc>>>, String> {
    let controllers: Controllers = get_controllers();

    let docs = secure_get_docs(caller, &controllers, collection.clone(), filter)?;

    let context = StoreContext {
        caller,
        controllers: &controllers,
        collection: &collection,
    };

    delete_filtered_docs_store_impl(&context, &docs)
}

fn delete_filtered_docs_store_impl(
    context: &StoreContext,
    docs: &ListResults<Doc>,
) -> Result<Vec<DocContext<Option<Doc>>>, String> {
    let rule = get_state_rule(context.collection)?;
    let auth_config = get_auth_config();

    let assert_context = AssertContext {
        rule: &rule,
        auth_config: &auth_config,
    };

    let mut results: Vec<DocContext<Option<Doc>>> = Vec::new();

    for (key, doc) in &docs.items {
        let value = DelDoc {
            version: doc.version,
        };

        let deleted_doc = delete_doc_impl(context, &assert_context, key.clone(), value)?;

        let doc_context = DocContext {
            key: key.clone(),
            collection: context.collection.clone(),
            data: deleted_doc,
        };

        results.push(doc_context);
    }

    Ok(results)
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn set_config_store(proposed_config: &SetDbConfig) -> Result<DbConfig, String> {
    let current_config = get_config();

    assert_set_config(proposed_config, &current_config)?;

    let config = DbConfig::prepare(&current_config, proposed_config);

    insert_config(&config);

    Ok(config)
}

pub fn get_config_store() -> Option<DbConfig> {
    get_config()
}

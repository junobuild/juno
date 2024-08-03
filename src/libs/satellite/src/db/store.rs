use crate::controllers::store::get_controllers;
use crate::db::msg::ERROR_CANNOT_WRITE;
use crate::db::state::{
    count_docs_heap, count_docs_stable, delete_collection as delete_state_collection,
    delete_doc as delete_state_doc, get_config, get_doc as get_state_doc, get_docs_heap,
    get_docs_stable, get_rule as get_state_rule, init_collection as init_state_collection,
    insert_config, insert_doc as insert_state_doc,
    is_collection_empty as is_state_collection_empty,
};
use crate::db::types::config::DbConfig;
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Doc, DocAssertDelete, DocAssertSet, DocContext, DocUpsert};
use crate::db::utils::filter_values;
use crate::hooks::{invoke_assert_delete_doc, invoke_assert_set_doc};
use crate::memory::STATE;
use crate::rules::assert_stores::assert_user_collection_caller_key;
use candid::Principal;
use junobuild_collections::assert_stores::{
    assert_create_permission, assert_permission, public_permission,
};
use junobuild_collections::msg::COLLECTION_NOT_EMPTY;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Permission, Rule};
use junobuild_shared::assert::{assert_description_length, assert_memory_size, assert_version};
use junobuild_shared::list::list_values;
use junobuild_shared::types::core::Key;
use junobuild_shared::types::list::{ListParams, ListResults};
use junobuild_shared::types::state::{Controllers, UserId, Version};

/// Collection

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
        return Err([COLLECTION_NOT_EMPTY, collection].join(""));
    }

    delete_state_collection(collection, memory)?;

    Ok(())
}

/// Get

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

    secure_get_doc(caller, &controllers, collection, key)
}

fn secure_get_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
) -> Result<Option<Doc>, String> {
    let rule = get_state_rule(&collection)?;
    get_doc_impl(caller, controllers, collection, key, &rule)
}

fn get_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    let value = get_state_doc(&collection, &key, rule)?;

    match value {
        None => Ok(None),
        Some(value) => {
            if !assert_permission(&rule.read, value.owner, caller, controllers) {
                return Ok(None);
            }

            Ok(Some(value))
        }
    }
}

/// Insert

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

    let data = secure_set_doc(
        caller,
        &controllers,
        &config,
        collection.clone(),
        key.clone(),
        value,
    )?;

    Ok(DocContext {
        key,
        collection,
        data,
    })
}

fn secure_set_doc(
    caller: Principal,
    controllers: &Controllers,
    config: &Option<DbConfig>,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
) -> Result<DocUpsert, String> {
    let rule = get_state_rule(&collection)?;
    set_doc_impl(caller, controllers, config, collection, key, value, &rule)
}

fn set_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    config: &Option<DbConfig>,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
    rule: &Rule,
) -> Result<DocUpsert, String> {
    let current_doc = get_state_doc(&collection, &key, rule)?;

    assert_write_permission(caller, controllers, &current_doc, &rule.write)?;

    assert_max_memory_size(config)?;

    assert_write_version(&current_doc, value.version)?;

    assert_description_length(&value.description)?;

    assert_user_collection_caller_key(caller, &collection, &key)?;

    invoke_assert_set_doc(
        &caller,
        &DocContext {
            key: key.clone(),
            collection: collection.clone(),
            data: DocAssertSet {
                current: current_doc.clone(),
                proposed: value.clone(),
            },
        },
    )?;

    let doc: Doc = Doc::prepare(caller, &current_doc, value);

    let (_evicted_doc, after) = insert_state_doc(&collection, &key, &doc, rule)?;

    Ok(DocUpsert {
        before: current_doc,
        after,
    })
}

/// List

/// List documents in a collection.
///
/// This function retrieves a list of documents from a collection's store based on the specified parameters.
/// It returns a `Result<ListResults<Doc>, String>` where `Ok(ListResults)` contains the retrieved documents,
/// or an error message as `Err(String)` if the operation encounters issues.
///
/// # Parameters
/// - `caller`: The `Principal` representing the caller initiating the operation. If used in serverless functions, you can use `ic_cdk::id()` to pass an administrator controller.
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

fn secure_get_docs(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<ListResults<Doc>, String> {
    let rule = get_state_rule(&collection)?;

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
    let matches = filter_values(caller, controllers, &rule.read, docs, filters);

    let results = list_values(&matches, filters);

    Ok(results)
}

/// Delete

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

    let doc = secure_delete_doc(caller, &controllers, collection.clone(), key.clone(), value)?;

    Ok(DocContext {
        key,
        collection,
        data: doc,
    })
}

fn secure_delete_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
) -> Result<Option<Doc>, String> {
    let rule = get_state_rule(&collection)?;
    delete_doc_impl(caller, controllers, collection, key, value, &rule)
}

fn delete_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    let current_doc = get_state_doc(&collection, &key, rule)?;

    assert_write_permission(caller, controllers, &current_doc, &rule.write)?;

    assert_write_version(&current_doc, value.version)?;

    invoke_assert_delete_doc(
        &caller,
        &DocContext {
            key: key.clone(),
            collection: collection.clone(),
            data: DocAssertDelete {
                current: current_doc.clone(),
                proposed: value.clone(),
            },
        },
    )?;

    delete_state_doc(&collection, &key, rule)
}

fn assert_max_memory_size(config: &Option<DbConfig>) -> Result<(), String> {
    match config {
        None => Ok(()),
        Some(config) => assert_memory_size(&config.max_memory_size),
    }
}

fn assert_write_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: &Option<Doc>,
    rule: &Permission,
) -> Result<(), String> {
    // For existing collection and document, check user editing is the caller
    if !public_permission(rule) {
        match current_doc {
            None => {
                if !assert_create_permission(rule, caller, controllers) {
                    return Err(ERROR_CANNOT_WRITE.to_string());
                }
            }
            Some(current_doc) => {
                if !assert_permission(rule, current_doc.owner, caller, controllers) {
                    return Err(ERROR_CANNOT_WRITE.to_string());
                }
            }
        }
    }

    Ok(())
}

fn assert_write_version(
    current_doc: &Option<Doc>,
    user_version: Option<Version>,
) -> Result<(), String> {
    // Validate timestamp
    match current_doc.clone() {
        None => (),
        Some(current_doc) => match assert_version(user_version, current_doc.version) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    Ok(())
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
pub fn count_docs_store(collection: &CollectionKey) -> Result<usize, String> {
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

/// Config

pub fn set_config_store(config: &DbConfig) {
    insert_config(config);
}

pub fn get_config_store() -> Option<DbConfig> {
    get_config()
}

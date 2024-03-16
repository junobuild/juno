use crate::assert::assert_description_length;
use crate::controllers::store::get_controllers;
use crate::db::state::{
    count_docs_heap, count_docs_stable, delete_collection as delete_state_collection,
    delete_doc as delete_state_doc, get_doc as get_state_doc, get_docs_heap, get_docs_stable,
    get_rule as get_state_rule, init_collection as init_state_collection,
    insert_doc as insert_state_doc, is_collection_empty as is_state_collection_empty,
};
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::db::utils::{filter_keyed_values, filter_values};
use crate::list::utils::{list_keyed_values, list_values};
use crate::memory::STATE;
use crate::msg::{COLLECTION_NOT_EMPTY, ERROR_CANNOT_WRITE};
use crate::rules::assert_stores::{assert_create_permission, assert_permission, public_permission};
use crate::rules::types::rules::{Memory, Permission, Rule};
use crate::types::core::{CollectionKey, Key, Keyed};
use crate::types::list::{ListParams, ListResults};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_shared::assert::assert_timestamp;
use junobuild_shared::types::state::{Controllers, UserId};

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

    let data = secure_insert_doc(caller, &controllers, collection.clone(), key.clone(), value)?;

    Ok(DocContext {
        key,
        collection,
        data,
    })
}

fn secure_insert_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
) -> Result<DocUpsert, String> {
    let rule = get_state_rule(&collection)?;
    insert_doc_impl(caller, controllers, collection, key, value, &rule)
}

fn insert_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
    rule: &Rule,
) -> Result<DocUpsert, String> {
    let current_doc = get_state_doc(&collection, &key, rule)?;

    match assert_write_permission(
        caller,
        controllers,
        &current_doc,
        &rule.write,
        value.updated_at,
    ) {
        Ok(_) => (),
        Err(e) => {
            return Err(e);
        }
    }

    assert_description_length(&value.description)?;

    let now = time();

    let created_at: u64 = match &current_doc {
        None => now,
        Some(current_doc) => current_doc.created_at,
    };

    let owner: UserId = match &current_doc {
        None => caller,
        Some(current_doc) => current_doc.owner,
    };

    let updated_at: u64 = now;

    let doc: Doc = Doc {
        created_at,
        updated_at,
        data: value.data,
        owner,
        description: value.description,
    };

    let after = insert_state_doc(&collection, &key, &doc, rule)?;

    Ok(DocUpsert {
        before: current_doc,
        after,
    })
}

/// List

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
            let binding = state.borrow();
            let stable = get_docs_stable(&collection, &binding.stable.db)?;
            get_docs_keyed_impl(stable, caller, controllers, filter, &rule)
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

fn get_docs_keyed_impl<'a, I, K>(
    docs: I,
    caller: Principal,
    controllers: &Controllers,
    filters: &ListParams,
    rule: &Rule,
) -> Result<ListResults<Doc>, String>
where
    I: Iterator<Item = (K, Doc)> + 'a,
    K: Keyed + 'a,
{
    let matches = filter_keyed_values(caller, controllers, &rule.read, docs, filters);

    let results = list_keyed_values(matches, filters);

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

    match assert_write_permission(
        caller,
        controllers,
        &current_doc,
        &rule.write,
        value.updated_at,
    ) {
        Ok(_) => (),
        Err(e) => {
            return Err(e);
        }
    }

    delete_state_doc(&collection, &key, rule)
}

fn assert_write_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: &Option<Doc>,
    rule: &Permission,
    user_timestamp: Option<u64>,
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

    // Validate timestamp
    match current_doc.clone() {
        None => (),
        Some(current_doc) => match assert_timestamp(user_timestamp, current_doc.updated_at) {
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

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let keys = get_docs_heap(collection, &state.borrow().heap.db.db)
                .map(|docs| docs.into_iter().map(|(key, _)| key.clone()).collect())?;
            delete_docs_impl(&keys, collection, &rule)
        }),
        Memory::Stable => STATE.with(|state| {
            let keys = get_docs_stable(collection, &state.borrow().stable.db)
                .map(|docs| docs.map(|(key, _)| key.clone()).collect())?;
            delete_docs_keyed_impl(&keys, collection, &rule)
        }),
    }
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

fn delete_docs_keyed_impl<K>(
    keys: &Vec<K>,
    collection: &CollectionKey,
    rule: &Rule,
) -> Result<(), String>
where
    K: Keyed,
{
    for key in keys {
        delete_state_doc(collection, key.key_ref(), rule)?;
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

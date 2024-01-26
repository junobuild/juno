use crate::assert::assert_description_length;
use crate::controllers::store::get_controllers;
use crate::db::state::{
    delete_collection as delete_state_collection, delete_doc as delete_state_doc,
    get_doc as get_state_doc, get_docs_heap, get_docs_stable, get_rule as get_state_rule,
    init_collection as init_state_collection, insert_doc as insert_state_doc,
    is_collection_empty as is_state_collection_empty,
};
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Doc, DocContext, DocUpsert};
use crate::db::utils::filter_values;
use crate::list::utils::list_values;
use crate::memory::STATE;
use crate::msg::{COLLECTION_NOT_EMPTY, ERROR_CANNOT_WRITE};
use crate::rules::assert_stores::{assert_create_permission, assert_permission, public_permission};
use crate::rules::types::rules::{Memory, Permission, Rule};
use crate::types::core::{CollectionKey, Key};
use crate::types::list::{ListParams, ListResults};
use candid::Principal;
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::types::state::{Controllers, UserId};

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

    let updated_at: u64 = now;

    let doc: Doc = Doc {
        created_at,
        updated_at,
        data: value.data,
        owner: caller,
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

pub fn count_docs_store(collection: &CollectionKey) -> Result<usize, String> {
    let rule = get_state_rule(collection)?;

    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            let state_ref = state.borrow();
            let docs = get_docs_heap(collection, &state_ref.heap.db.db)?;
            Ok(docs.len())
        }),
        Memory::Stable => STATE.with(|state| {
            let stable = get_docs_stable(collection, &state.borrow().stable.db)?;
            Ok(stable.len())
        }),
    }
}

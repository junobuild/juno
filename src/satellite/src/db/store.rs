use crate::assert::assert_description_length;
use crate::db::memory::{
    delete_doc as delete_memory_doc, get_doc as get_memory_doc, insert_doc as insert_memory_doc,
};
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Collection, DbHeap, Doc};
use crate::db::utils::filter_values;
use crate::list::utils::list_values;
use crate::memory::STATE;
use crate::msg::{
    COLLECTION_NOT_EMPTY, COLLECTION_NOT_FOUND, COLLECTION_READ_RULE_MISSING,
    COLLECTION_WRITE_RULE_MISSING, ERROR_CANNOT_WRITE,
};
use crate::rules::types::rules::{Permission, Rule};
use crate::rules::utils::{assert_create_rule, assert_rule, public_rule};
use crate::types::core::{CollectionKey, Key};
use crate::types::list::{ListParams, ListResults};
use crate::types::state::State;
use candid::Principal;
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::types::state::Controllers;
use std::collections::BTreeMap;

/// Collection

pub fn init_collection(collection: CollectionKey) {
    STATE.with(|state| init_collection_impl(collection, &mut state.borrow_mut().heap.db.db))
}

pub fn delete_collection(collection: CollectionKey) -> Result<(), String> {
    STATE.with(|state| delete_collection_impl(collection, &mut state.borrow_mut().heap.db.db))
}

fn init_collection_impl(collection: CollectionKey, db: &mut DbHeap) {
    let col = db.get(&collection);

    match col {
        Some(_) => {}
        None => {
            db.insert(collection, BTreeMap::new());
        }
    }
}

fn delete_collection_impl(collection: CollectionKey, db: &mut DbHeap) -> Result<(), String> {
    let col = db.get_mut(&collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, &collection].join("")),
        Some(col) => {
            if !col.is_empty() {
                return Err([COLLECTION_NOT_EMPTY, &collection].join(""));
            }

            db.remove(&collection);

            Ok(())
        }
    }
}

/// Get

pub fn get_doc(
    caller: Principal,
    collection: CollectionKey,
    key: Key,
) -> Result<Option<Doc>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    STATE.with(|state| secure_get_doc(caller, &controllers, collection, key, &state.borrow()))
}

fn secure_get_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    state: &State,
) -> Result<Option<Doc>, String> {
    let rules = state.heap.db.rules.get(&collection);

    match rules {
        None => Err([COLLECTION_READ_RULE_MISSING, &collection].join("")),
        Some(rule) => get_doc_impl(caller, controllers, collection, key, rule),
    }
}

fn get_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    let value = get_memory_doc(&collection, &key, rule)?;

    match value {
        None => Ok(None),
        Some(value) => {
            if !assert_rule(&rule.read, value.owner, caller, controllers) {
                return Ok(None);
            }

            Ok(Some(value))
        }
    }
}

/// Insert

pub fn insert_doc(
    caller: Principal,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
) -> Result<Doc, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    STATE.with(|state| {
        secure_insert_doc(
            caller,
            &controllers,
            collection,
            key,
            value,
            &state.borrow(),
        )
    })
}

fn secure_insert_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
    state: &State,
) -> Result<Doc, String> {
    let rules = state.heap.db.rules.get(&collection);

    match rules {
        None => Err([COLLECTION_WRITE_RULE_MISSING, &collection].join("")),
        Some(rule) => insert_doc_impl(caller, controllers, collection, key, value, rule),
    }
}

fn insert_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
    rule: &Rule,
) -> Result<Doc, String> {
    let current_doc = get_memory_doc(&collection, &key, rule)?;

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

    insert_memory_doc(&collection, &key, &doc, rule)
}

/// List

pub fn get_docs(
    caller: Principal,
    collection: CollectionKey,
    filter: &ListParams,
) -> Result<ListResults<Doc>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    STATE.with(|state| secure_get_docs(caller, &controllers, collection, filter, &state.borrow()))
}

fn secure_get_docs(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    filter: &ListParams,
    state: &State,
) -> Result<ListResults<Doc>, String> {
    let rules = state.heap.db.rules.get(&collection);

    match rules {
        None => Err([COLLECTION_READ_RULE_MISSING, &collection].join("")),
        Some(rule) => get_docs_impl(
            caller,
            controllers,
            collection,
            filter,
            &rule.read,
            &state.heap.db.db,
        ),
    }
}

fn get_docs_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    filter: &ListParams,
    rule: &Permission,
    db: &DbHeap,
) -> Result<ListResults<Doc>, String> {
    let col = db.get(&collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, &collection].join("")),
        Some(col) => Ok(get_values(caller, controllers, rule, col, filter)),
    }
}

fn get_values(
    caller: Principal,
    controllers: &Controllers,
    rule: &Permission,
    col: &Collection,
    filters: &ListParams,
) -> ListResults<Doc> {
    let matches = filter_values(caller, controllers, rule, col, filters);

    list_values(matches, filters)
}

/// Delete

pub fn delete_doc(
    caller: Principal,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
) -> Result<(), String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().heap.controllers.clone());

    STATE.with(|state| {
        secure_delete_doc(
            caller,
            &controllers,
            collection,
            key,
            value,
            &state.borrow(),
        )
    })
}

fn secure_delete_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
    state: &State,
) -> Result<(), String> {
    let rules = state.heap.db.rules.get(&collection);

    match rules {
        None => Err([COLLECTION_WRITE_RULE_MISSING, &collection].join("")),
        Some(rule) => delete_doc_impl(caller, controllers, collection, key, value, rule),
    }
}

fn delete_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
    rule: &Rule,
) -> Result<(), String> {
    let current_doc = get_memory_doc(&collection, &key, rule)?;

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

    delete_memory_doc(&key, &collection, rule)
}

fn assert_write_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: &Option<Doc>,
    rule: &Permission,
    user_timestamp: Option<u64>,
) -> Result<(), String> {
    // For existing collection and document, check user editing is the caller
    if !public_rule(rule) {
        match current_doc {
            None => {
                if !assert_create_rule(rule, caller, controllers) {
                    return Err(ERROR_CANNOT_WRITE.to_string());
                }
            }
            Some(current_doc) => {
                if !assert_rule(rule, current_doc.owner, caller, controllers) {
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

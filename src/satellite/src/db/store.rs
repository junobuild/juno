use crate::assert::assert_description_length;
use crate::controllers::store::get_controllers;
use crate::db::state::{
    delete_collection as delete_state_collection, delete_doc as delete_state_doc,
    get_doc as get_state_doc, get_docs as get_state_docs, get_rule as get_state_rule,
    init_collection as init_state_collection, insert_doc as insert_state_doc,
    is_collection_empty as is_state_collection_empty,
};
use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::Doc;
use crate::db::utils::filter_values;
use crate::list::utils::list_values;
use crate::msg::{COLLECTION_NOT_EMPTY, ERROR_CANNOT_WRITE};
use crate::rules::types::rules::{Memory, Permission, Rule};
use crate::rules::utils::{assert_create_rule, assert_rule, public_rule};
use crate::types::core::{CollectionKey, Key};
use crate::types::list::{ListParams, ListResults};
use candid::Principal;
use ic_cdk::api::time;
use shared::assert::assert_timestamp;
use shared::types::state::Controllers;

/// Collection

pub fn init_collection(collection: &CollectionKey, memory: &Memory) {
    init_state_collection(collection, memory);
}

pub fn delete_collection(collection: &CollectionKey) -> Result<(), String> {
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

pub fn get_doc(
    caller: Principal,
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
    let controllers: Controllers = get_controllers();

    secure_insert_doc(caller, &controllers, collection, key, value)
}

fn secure_insert_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: SetDoc,
) -> Result<Doc, String> {
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
) -> Result<Doc, String> {
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

    insert_state_doc(&collection, &key, &doc, rule)
}

/// List

pub fn get_docs(
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
    get_docs_impl(caller, controllers, collection, filter, &rule)
}

fn get_docs_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    filters: &ListParams,
    rule: &Rule,
) -> Result<ListResults<Doc>, String> {
    let items = get_state_docs(&collection, rule)?;

    let matches = filter_values(caller, controllers, &rule.read, &items, filters);

    let results = list_values(matches, filters);

    Ok(results)
}

/// Delete

pub fn delete_doc(
    caller: Principal,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
) -> Result<(), String> {
    let controllers: Controllers = get_controllers();

    secure_delete_doc(caller, &controllers, collection, key, value)
}

fn secure_delete_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: CollectionKey,
    key: Key,
    value: DelDoc,
) -> Result<(), String> {
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
) -> Result<(), String> {
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

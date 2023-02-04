use crate::db::types::interface::{DelDoc, SetDoc};
use crate::db::types::state::{Collection, Db, Doc};
use crate::list::utils::list_values;
use crate::rules::types::rules::Permission;
use crate::rules::utils::{assert_rule, public_rule};
use crate::types::core::Key;
use crate::types::list::{ListParams, ListResults};
use crate::types::state::State;
use crate::utils::assert_timestamp;
use crate::STATE;
use candid::Principal;
use ic_cdk::api::time;
use regex::Regex;
use shared::types::interface::Controllers;
use std::collections::BTreeMap;

pub fn init_collection(collection: String) {
    STATE.with(|state| init_collection_impl(collection, &mut state.borrow_mut().stable.db.db))
}

fn init_collection_impl(collection: String, db: &mut Db) {
    let col = db.get(&collection);

    match col {
        Some(_) => {}
        None => {
            db.insert(collection, BTreeMap::new());
        }
    }
}

/// Get

pub fn get_doc(caller: Principal, collection: String, key: String) -> Result<Option<Doc>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| secure_get_doc(caller, &controllers, collection, key, &state.borrow()))
}

fn secure_get_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    state: &State,
) -> Result<Option<Doc>, String> {
    let rules = state.stable.db.rules.get(&collection);

    match rules {
        None => Err("Collection read rule not configured.".to_string()),
        Some(rule) => get_doc_impl(
            caller,
            controllers,
            collection,
            key,
            &rule.read,
            &state.stable.db.db,
        ),
    }
}

fn get_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    rule: &Permission,
    db: &Db,
) -> Result<Option<Doc>, String> {
    let col = db.get(&collection);

    match col {
        None => Err(["Collection not found: ", &*collection].join("")),
        Some(col) => {
            let value = col.get(&key);

            match value {
                None => Ok(None),
                Some(value) => {
                    if !assert_rule(rule, value.owner, caller, controllers) {
                        return Err("Caller not allowed to read.".to_string());
                    }

                    Ok(Some(value.clone()))
                }
            }
        }
    }
}

/// Insert

pub fn insert_doc(
    caller: Principal,
    collection: String,
    key: String,
    value: SetDoc,
) -> Result<Doc, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| {
        secure_insert_doc(
            caller,
            &controllers,
            collection,
            key,
            value,
            &mut state.borrow_mut(),
        )
    })
}

fn secure_insert_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    value: SetDoc,
    state: &mut State,
) -> Result<Doc, String> {
    let rules = state.stable.db.rules.get(&collection);

    match rules {
        None => Err("Collection write rule not configured.".to_string()),
        Some(rule) => insert_doc_impl(
            caller,
            controllers,
            collection,
            key,
            value,
            &rule.write,
            &mut state.stable.db.db,
        ),
    }
}

fn insert_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    value: SetDoc,
    rule: &Permission,
    db: &mut Db,
) -> Result<Doc, String> {
    let col = db.get_mut(&collection);

    match col {
        None => Err("Collection has not been initialized.".to_string()),
        Some(col) => {
            let current_doc = col.get(&key);

            match assert_write_permission(caller, controllers, current_doc, rule, value.updated_at)
            {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }

            let now = time();

            let created_at: u64 = match current_doc {
                None => now,
                Some(current_doc) => current_doc.created_at,
            };

            let updated_at: u64 = now;

            let doc: Doc = Doc {
                created_at,
                updated_at,
                data: value.data,
                owner: caller,
            };

            col.insert(key, doc.clone());

            Ok(doc)
        }
    }
}

/// List

pub fn get_docs(
    caller: Principal,
    collection: String,
    filter: &ListParams,
) -> Result<ListResults<Doc>, String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| secure_get_docs(caller, &controllers, collection, filter, &state.borrow()))
}

fn secure_get_docs(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    filter: &ListParams,
    state: &State,
) -> Result<ListResults<Doc>, String> {
    let rules = state.stable.db.rules.get(&collection);

    match rules {
        None => Err("Collection read rule not configured.".to_string()),
        Some(rule) => get_docs_impl(
            caller,
            controllers,
            collection,
            filter,
            &rule.read,
            &state.stable.db.db,
        ),
    }
}

fn get_docs_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    filter: &ListParams,
    rule: &Permission,
    db: &Db,
) -> Result<ListResults<Doc>, String> {
    let col = db.get(&collection);

    match col {
        None => Err(["Collection not found: ", &collection].join("")),
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

fn filter_values(
    caller: Principal,
    controllers: &Controllers,
    rule: &Permission,
    col: &Collection,
    ListParams {
        matcher,
        order: _,
        paginate: _,
    }: &ListParams,
) -> Vec<(Key, Doc)> {
    match matcher {
        None => col
            .iter()
            .filter(|(_key, doc)| assert_rule(rule, doc.owner, caller, controllers))
            .map(|(key, doc)| (key.clone(), doc.clone()))
            .collect(),
        Some(filter) => {
            let re = Regex::new(filter).unwrap();
            col.iter()
                .filter(|(key, doc)| {
                    re.is_match(key) && assert_rule(rule, doc.owner, caller, controllers)
                })
                .map(|(key, doc)| (key.clone(), doc.clone()))
                .collect()
        }
    }
}

/// Delete

pub fn delete_doc(
    caller: Principal,
    collection: String,
    key: String,
    value: DelDoc,
) -> Result<(), String> {
    let controllers: Controllers = STATE.with(|state| state.borrow().stable.controllers.clone());

    STATE.with(|state| {
        secure_delete_doc(
            caller,
            &controllers,
            collection,
            key,
            value,
            &mut state.borrow_mut(),
        )
    })
}

fn secure_delete_doc(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    value: DelDoc,
    state: &mut State,
) -> Result<(), String> {
    let rules = state.stable.db.rules.get(&collection);

    match rules {
        None => Err("Collection write rule not configured.".to_string()),
        Some(rule) => delete_doc_impl(
            caller,
            controllers,
            collection,
            key,
            value,
            &rule.write,
            &mut state.stable.db.db,
        ),
    }
}

fn delete_doc_impl(
    caller: Principal,
    controllers: &Controllers,
    collection: String,
    key: String,
    value: DelDoc,
    rule: &Permission,
    db: &mut Db,
) -> Result<(), String> {
    let col = db.get_mut(&collection);

    match col {
        None => Err("Collection has not been initialized.".to_string()),
        Some(col) => {
            let current_doc = col.get(&key);

            match assert_write_permission(caller, controllers, current_doc, rule, value.updated_at)
            {
                Ok(_) => (),
                Err(e) => {
                    return Err(e);
                }
            }

            col.remove(&key);

            Ok(())
        }
    }
}

fn assert_write_permission(
    caller: Principal,
    controllers: &Controllers,
    current_doc: Option<&Doc>,
    rule: &Permission,
    user_timestamp: Option<u64>,
) -> Result<(), String> {
    // For existing collection and document, check user editing is the caller
    if !public_rule(rule) {
        match current_doc {
            None => (),
            Some(current_doc) => {
                if !assert_rule(rule, current_doc.owner, caller, controllers) {
                    return Err("Caller not allowed to write.".to_string());
                }
            }
        }
    }

    // Validate timestamp
    match current_doc {
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

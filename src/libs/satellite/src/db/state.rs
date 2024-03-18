use crate::db::types::state::{DbHeap, DbStable, DbUsersStable, Doc, StableKey, UserStableKey};
use crate::list::utils::range_collection_end;
use crate::memory::STATE;
use crate::msg::COLLECTION_NOT_FOUND;
use crate::rules::types::rules::{Memory, Rule};
use crate::types::core::{CollectionKey, Key};
use candid::Principal;
use junobuild_shared::types::state::UserId;
use std::collections::BTreeMap;
use std::ops::RangeBounds;

/// Collections

pub fn init_collection(collection: &CollectionKey, memory: &Memory) {
    match memory {
        Memory::Heap => {
            STATE.with(|state| init_collection_heap(collection, &mut state.borrow_mut().heap.db.db))
        }
        Memory::Stable | Memory::StableUsers => (),
    }
}

pub fn is_collection_empty(
    collection: &CollectionKey,
    memory: &Option<Memory>,
) -> Result<bool, String> {
    match memory.clone().unwrap_or_default() {
        Memory::Heap => {
            STATE.with(|state| is_collection_empty_heap(collection, &state.borrow().heap.db.db))
        }
        Memory::Stable => {
            STATE.with(|state| is_collection_empty_stable(collection, &state.borrow().stable.db))
        }
        Memory::StableUsers => STATE.with(|state| {
            is_collection_empty_users_stable(collection, &state.borrow().stable.db_users)
        }),
    }
}

pub fn delete_collection(
    collection: &CollectionKey,
    memory: &Option<Memory>,
) -> Result<(), String> {
    match memory.clone().unwrap_or_default() {
        Memory::Heap => STATE
            .with(|state| delete_collection_heap(collection, &mut state.borrow_mut().heap.db.db)),
        Memory::Stable | Memory::StableUsers => Ok(()),
    }
}

// Init

fn init_collection_heap(collection: &CollectionKey, db: &mut DbHeap) {
    let col = db.get(collection);

    match col {
        Some(_) => {}
        None => {
            db.insert(collection.clone(), BTreeMap::new());
        }
    }
}

// Is empty

fn is_collection_empty_heap(collection: &CollectionKey, db: &DbHeap) -> Result<bool, String> {
    let col = db.get(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => Ok(col.is_empty()),
    }
}

fn is_collection_empty_stable(collection: &CollectionKey, db: &DbStable) -> Result<bool, String> {
    let stable = get_docs_stable(collection, db)?;
    Ok(stable.is_empty())
}

fn is_collection_empty_users_stable(
    collection: &CollectionKey,
    db: &DbUsersStable,
) -> Result<bool, String> {
    let stable = get_docs_users_stable(collection, &None, db)?;
    Ok(stable.is_empty())
}

// Delete

fn delete_collection_heap(collection: &CollectionKey, db: &mut DbHeap) -> Result<(), String> {
    let col = db.get(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(_) => {
            db.remove(collection);

            Ok(())
        }
    }
}

/// Documents

pub fn get_doc(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| get_doc_heap(collection, key, &state.borrow().heap.db.db))
        }
        Memory::Stable => {
            STATE.with(|state| get_doc_stable(collection, key, &state.borrow().stable.db))
        }
        Memory::StableUsers => STATE.with(|state| {
            get_doc_users_stable(collection, key, owner, &state.borrow().stable.db_users)
        }),
    }
}

pub fn insert_doc(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    doc: &Doc,
    rule: &Rule,
) -> Result<Doc, String> {
    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            insert_doc_heap(collection, key, doc, &mut state.borrow_mut().heap.db.db)
        }),
        Memory::Stable => STATE.with(|state| {
            insert_doc_stable(collection, key, doc, &mut state.borrow_mut().stable.db)
        }),
        Memory::StableUsers => STATE.with(|state| {
            insert_doc_users_stable(
                collection,
                key,
                owner,
                doc,
                &mut state.borrow_mut().stable.db_users,
            )
        }),
    }
}

pub fn delete_doc(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| delete_doc_heap(collection, key, &mut state.borrow_mut().heap.db.db))
        }
        Memory::Stable => STATE
            .with(|state| delete_doc_stable(collection, key, &mut state.borrow_mut().stable.db)),
        Memory::StableUsers => STATE.with(|state| {
            delete_doc_users_stable(
                collection,
                key,
                owner,
                &mut state.borrow_mut().stable.db_users,
            )
        }),
    }
}

// Get

fn get_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    db: &DbStable,
) -> Result<Option<Doc>, String> {
    let value = db.get(&stable_key(collection, key));

    match value {
        None => Ok(None),
        Some(value) => Ok(Some(value)),
    }
}

fn get_doc_users_stable(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    db: &DbUsersStable,
) -> Result<Option<Doc>, String> {
    let value = db.get(&user_stable_key(collection, key, owner));

    match value {
        None => Ok(None),
        Some(value) => Ok(Some(value)),
    }
}

fn get_doc_heap(collection: &CollectionKey, key: &Key, db: &DbHeap) -> Result<Option<Doc>, String> {
    let col = db.get(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => {
            let value = col.get(key);

            match value {
                None => Ok(None),
                Some(value) => Ok(Some(value.clone())),
            }
        }
    }
}

// List

pub fn get_docs_stable(
    collection: &CollectionKey,
    db: &DbStable,
) -> Result<Vec<(StableKey, Doc)>, String> {
    let items = db.range(filter_docs_stable_range(collection)).collect();

    Ok(items)
}

pub fn get_docs_users_stable(
    collection: &CollectionKey,
    owner: &Option<UserId>,
    db: &DbUsersStable,
) -> Result<Vec<(UserStableKey, Doc)>, String> {
    let items = db
        .range(filter_docs_users_stable_range(collection, owner))
        .collect();

    Ok(items)
}

pub fn get_docs_heap<'a>(
    collection: &CollectionKey,
    db: &'a DbHeap,
) -> Result<Vec<(&'a Key, &'a Doc)>, String> {
    let col = db.get(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => {
            let items = col.iter().collect();
            Ok(items)
        }
    }
}

pub fn count_docs_heap(collection: &CollectionKey, db: &DbHeap) -> Result<usize, String> {
    let col = db.get(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => Ok(col.len()),
    }
}

pub fn count_docs_stable(collection: &CollectionKey, db: &DbStable) -> Result<usize, String> {
    let length = db.range(filter_docs_stable_range(collection)).count();

    Ok(length)
}

pub fn count_docs_users_stable(
    collection: &CollectionKey,
    db: &DbUsersStable,
) -> Result<usize, String> {
    let length = db
        .range(filter_docs_users_stable_range(collection, &None))
        .count();

    Ok(length)
}

fn filter_docs_stable_range(collection: &CollectionKey) -> impl RangeBounds<StableKey> {
    let start_key = StableKey {
        collection: collection.clone(),
        key: "".to_string(),
    };

    let end_key = StableKey {
        collection: range_collection_end(collection).clone(),
        key: "".to_string(),
    };

    start_key..end_key
}

const PRINCIPAL_MIN: Principal = Principal::from_slice(&[]);
const PRINCIPAL_MAX: Principal = Principal::from_slice(&[255; 29]);

fn filter_docs_users_stable_range(
    collection: &CollectionKey,
    owner: &Option<UserId>,
) -> impl RangeBounds<UserStableKey> {
    let start_key = UserStableKey {
        owner: owner.unwrap_or(PRINCIPAL_MIN),
        collection: collection.clone(),
        key: "".to_string(),
    };

    let end_key = UserStableKey {
        owner: owner.unwrap_or(PRINCIPAL_MAX),
        collection: range_collection_end(collection).clone(),
        key: "".to_string(),
    };

    start_key..end_key
}

// Insert

fn insert_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    db: &mut DbStable,
) -> Result<Doc, String> {
    db.insert(stable_key(collection, key), doc.clone());

    Ok(doc.clone())
}

fn insert_doc_users_stable(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    doc: &Doc,
    db: &mut DbUsersStable,
) -> Result<Doc, String> {
    db.insert(user_stable_key(collection, key, owner), doc.clone());

    Ok(doc.clone())
}

fn insert_doc_heap(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    db: &mut DbHeap,
) -> Result<Doc, String> {
    let col = db.get_mut(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => {
            col.insert(key.clone(), doc.clone());
            Ok(doc.clone())
        }
    }
}

// Delete

fn delete_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    db: &mut DbStable,
) -> Result<Option<Doc>, String> {
    let deleted_doc = db.remove(&stable_key(collection, key));

    Ok(deleted_doc)
}

fn delete_doc_users_stable(
    collection: &CollectionKey,
    key: &Key,
    owner: &UserId,
    db: &mut DbUsersStable,
) -> Result<Option<Doc>, String> {
    let deleted_doc = db.remove(&user_stable_key(collection, key, owner));

    Ok(deleted_doc)
}

fn delete_doc_heap(
    collection: &CollectionKey,
    key: &Key,
    db: &mut DbHeap,
) -> Result<Option<Doc>, String> {
    let col = db.get_mut(collection);

    match col {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(col) => {
            let deleted_doc = col.remove(key);

            Ok(deleted_doc)
        }
    }
}

fn stable_key(collection: &CollectionKey, key: &Key) -> StableKey {
    StableKey {
        collection: collection.clone(),
        key: key.clone(),
    }
}

fn user_stable_key(collection: &CollectionKey, key: &Key, owner: &UserId) -> UserStableKey {
    UserStableKey {
        owner: owner.clone(),
        collection: collection.clone(),
        key: key.clone(),
    }
}

/// Rules

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let state = &state.borrow().heap.db.rules.clone();
        let rules = state.get(collection);

        rules.cloned()
    });

    match rule {
        None => Err([COLLECTION_NOT_FOUND, collection].join("")),
        Some(rule) => Ok(rule),
    }
}

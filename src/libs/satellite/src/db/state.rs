use crate::db::types::state::{DbCollectionsStable, DbHeap, DbStable, Doc, StableKey};
use crate::list::utils::range_collection_end;
use crate::memory::{init_stable_db_collection, STATE};
use crate::msg::COLLECTION_NOT_FOUND;
use crate::rules::types::rules::{Memory, Rule};
use crate::types::core::{CollectionKey, Key};
use crate::types::state::StableState;
use ic_cdk::print;
use std::collections::{BTreeMap};
use std::ops::RangeBounds;

/// Collections

pub fn init_collection(collection: &CollectionKey, memory: &Memory) {
    match memory {
        Memory::Heap => {
            STATE.with(|state| init_collection_heap(collection, &mut state.borrow_mut().heap.db.db))
        }
        Memory::Stable => (),
        Memory::StableV2 => STATE
            .with(|state| init_collection_stable_v2(collection, &mut state.borrow_mut().stable)),
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
        Memory::StableV2 => STATE.with(|state| {
            is_collection_empty_stable_v2(collection, &state.borrow().stable.db_collections)
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
        Memory::Stable => Ok(()),
        Memory::StableV2 => STATE.with(|state| {
            delete_collection_stable_v2(collection, &mut state.borrow_mut().stable.db_collections)
        }),
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

fn init_collection_stable_v2(collection: &CollectionKey, state: &mut StableState) {
    let col = state.db_collections.get(collection);

    match col {
        Some(_) => {}
        None => {
            let memory_id = u8::try_from(state.db_collections.len()).unwrap_or(0);

            state
                .db_collections
                .insert(collection.clone(), init_stable_db_collection(memory_id));

            state
                .db_collections_ids
                .insert(collection.clone(), memory_id);
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

fn is_collection_empty_stable_v2(
    collection: &CollectionKey,
    collections: &DbCollectionsStable,
) -> Result<bool, String> {
    if let Some(col) = collections.get(collection) {
        return Ok(col.is_empty());
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
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

fn delete_collection_stable_v2(
    collection: &CollectionKey,
    db: &mut DbCollectionsStable,
) -> Result<(), String> {
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

pub fn get_doc(collection: &CollectionKey, key: &Key, rule: &Rule) -> Result<Option<Doc>, String> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| get_doc_heap(collection, key, &state.borrow().heap.db.db))
        }
        Memory::Stable => {
            STATE.with(|state| get_doc_stable(collection, key, &state.borrow().stable.db))
        }
        Memory::StableV2 => STATE.with(|state| {
            get_doc_stable_v2(collection, key, &state.borrow().stable.db_collections)
        }),
    }
}

pub fn insert_doc(
    collection: &CollectionKey,
    key: &Key,
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
        Memory::StableV2 => STATE.with(|state| {
            insert_doc_stable_v2(
                collection,
                key,
                doc,
                &mut state.borrow_mut().stable.db_collections,
            )
        }),
    }
}

pub fn delete_doc(
    collection: &CollectionKey,
    key: &Key,
    rule: &Rule,
) -> Result<Option<Doc>, String> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| delete_doc_heap(collection, key, &mut state.borrow_mut().heap.db.db))
        }
        Memory::Stable => STATE
            .with(|state| delete_doc_stable(collection, key, &mut state.borrow_mut().stable.db)),
        Memory::StableV2 => STATE.with(|state| {
            delete_doc_stable_v2(
                collection,
                key,
                &mut state.borrow_mut().stable.db_collections,
            )
        }),
    }
}

// Get

fn get_doc_stable_v2(
    collection: &CollectionKey,
    key: &Key,
    collections: &DbCollectionsStable,
) -> Result<Option<Doc>, String> {
    if let Some(col) = collections.get(collection) {
        let value = col.get(key);

        let result = match value {
            None => Ok(None),
            Some(value) => Ok(Some(value)),
        };

        return result;
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
}

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

pub fn get_docs_stable_v2(
    collection: &CollectionKey,
    collections: &DbCollectionsStable,
) -> Result<Vec<(Key, Doc)>, String> {
    if let Some(col) = collections.get(collection) {
        let items: Vec<_> = col.iter().collect();

        print(format!("------------------> List items {}", items.len()));

        return Ok(items);
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
}

pub fn get_docs_stable(
    collection: &CollectionKey,
    db: &DbStable,
) -> Result<Vec<(StableKey, Doc)>, String> {
    let items = db.range(filter_docs_range(collection)).collect();

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

pub fn count_docs_stable_v2(
    collection: &CollectionKey,
    collections: &DbCollectionsStable,
) -> Result<usize, String> {
    if let Some(col) = collections.get(collection) {
        return Ok(col.len() as usize);
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
}

pub fn count_docs_stable(collection: &CollectionKey, db: &DbStable) -> Result<usize, String> {
    let length = db.range(filter_docs_range(collection)).count();

    Ok(length)
}

fn filter_docs_range(collection: &CollectionKey) -> impl RangeBounds<StableKey> {
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

// Insert

fn insert_doc_stable_v2(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    collections: &mut DbCollectionsStable,
) -> Result<Doc, String> {
    if let Some(col) = collections.get_mut(collection) {
        col.insert(key.clone(), doc.clone());
        return Ok(doc.clone());
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
}

fn insert_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    db: &mut DbStable,
) -> Result<Doc, String> {
    db.insert(stable_key(collection, key), doc.clone());

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

fn delete_doc_stable_v2(
    collection: &CollectionKey,
    key: &Key,
    collections: &mut DbCollectionsStable,
) -> Result<Option<Doc>, String> {
    if let Some(col) = collections.get_mut(collection) {
        let deleted_doc = col.remove(key);

        return Ok(deleted_doc);
    }

    Err([COLLECTION_NOT_FOUND, collection].join(""))
}

fn delete_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    db: &mut DbStable,
) -> Result<Option<Doc>, String> {
    let deleted_doc = db.remove(&stable_key(collection, key));

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

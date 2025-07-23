use crate::db::types::config::DbConfig;
use crate::db::types::state::{Collection, DbHeap, DbHeapState, DbStable, Doc, StableKey};
use crate::memory::internal::STATE;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Memory, Rule};
use junobuild_collections::utils::range_collection_end;
use junobuild_shared::structures::collect_stable_vec;
use junobuild_shared::types::core::Key;
use std::collections::BTreeMap;
use std::ops::RangeBounds;
// ---------------------------------------------------------
// Collections
// ---------------------------------------------------------

pub fn init_collection(collection: &CollectionKey, memory: &Memory) {
    match memory {
        Memory::Heap => {
            STATE.with(|state| init_collection_heap(collection, &mut state.borrow_mut().heap.db.db))
        }
        Memory::Stable => (),
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
        None => Err(msg_db_collection_not_found(collection)),
        Some(col) => Ok(col.is_empty()),
    }
}

fn is_collection_empty_stable(collection: &CollectionKey, db: &DbStable) -> Result<bool, String> {
    let stable = get_docs_stable(collection, db)?;
    Ok(stable.is_empty())
}

// Delete

fn delete_collection_heap(collection: &CollectionKey, db: &mut DbHeap) -> Result<(), String> {
    let col = db.get(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
        Some(_) => {
            db.remove(collection);

            Ok(())
        }
    }
}

// ---------------------------------------------------------
// Documents
// ---------------------------------------------------------

pub fn get_doc(collection: &CollectionKey, key: &Key, rule: &Rule) -> Result<Option<Doc>, String> {
    match rule.mem() {
        Memory::Heap => {
            STATE.with(|state| get_doc_heap(collection, key, &state.borrow().heap.db.db))
        }
        Memory::Stable => {
            STATE.with(|state| get_doc_stable(collection, key, &state.borrow().stable.db))
        }
    }
}

pub fn insert_doc(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    rule: &Rule,
) -> Result<(Option<(Key, Doc)>, Doc), String> {
    match rule.mem() {
        Memory::Heap => STATE.with(|state| {
            insert_doc_heap(
                collection,
                key,
                doc,
                rule.max_capacity,
                &mut state.borrow_mut().heap.db.db,
            )
        }),
        Memory::Stable => STATE.with(|state| {
            insert_doc_stable(
                collection,
                key,
                doc,
                rule.max_capacity,
                &mut state.borrow_mut().stable.db,
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

fn get_doc_heap(collection: &CollectionKey, key: &Key, db: &DbHeap) -> Result<Option<Doc>, String> {
    let col = db.get(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
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
    let items = collect_stable_vec(db.range(filter_docs_range(collection)));

    Ok(items)
}

pub fn get_docs_heap<'a>(
    collection: &CollectionKey,
    db: &'a DbHeap,
) -> Result<Vec<(&'a Key, &'a Doc)>, String> {
    let col = db.get(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
        Some(col) => {
            let items = col.iter().collect();
            Ok(items)
        }
    }
}

pub fn count_docs_heap(collection: &CollectionKey, db: &DbHeap) -> Result<usize, String> {
    let col = db.get(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
        Some(col) => Ok(col.len()),
    }
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

fn insert_doc_stable(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    max_capacity: Option<u32>,
    db: &mut DbStable,
) -> Result<(Option<(Key, Doc)>, Doc), String> {
    let evicted_doc = limit_docs_stable_capacity(collection, max_capacity, db)?;

    db.insert(stable_key(collection, key), doc.clone());

    Ok((evicted_doc.clone(), doc.clone()))
}

fn limit_docs_stable_capacity(
    collection: &CollectionKey,
    max_capacity: Option<u32>,
    db: &mut DbStable,
) -> Result<Option<(Key, Doc)>, String> {
    if let Some(max_capacity) = max_capacity {
        let col_length = count_docs_stable(collection, db)?;

        if col_length >= max_capacity as usize {
            let last_item = db.range(filter_docs_range(collection)).next();

            if let Some(entry) = last_item {
                let key = entry.key().key.clone();
                let evicted_doc = delete_doc_stable(collection, &key, db)?;

                return Ok(evicted_doc.map(|doc| (key, doc)));
            }
        }
    }

    Ok(None)
}

fn insert_doc_heap(
    collection: &CollectionKey,
    key: &Key,
    doc: &Doc,
    max_capacity: Option<u32>,
    db: &mut DbHeap,
) -> Result<(Option<(Key, Doc)>, Doc), String> {
    let col = db.get_mut(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
        Some(col) => {
            let evicted_doc = limit_docs_heap_capacity(max_capacity, col);

            col.insert(key.clone(), doc.clone());
            Ok((evicted_doc.clone(), doc.clone()))
        }
    }
}

fn limit_docs_heap_capacity(max_capacity: Option<u32>, col: &mut Collection) -> Option<(Key, Doc)> {
    if let Some(max_capacity) = max_capacity {
        if col.len() >= max_capacity as usize {
            return col.pop_first();
        }
    }

    None
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

fn delete_doc_heap(
    collection: &CollectionKey,
    key: &Key,
    db: &mut DbHeap,
) -> Result<Option<Doc>, String> {
    let col = db.get_mut(collection);

    match col {
        None => Err(msg_db_collection_not_found(collection)),
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

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule(collection: &CollectionKey) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        let state = &state.borrow().heap.db.rules.clone();
        let rules = state.get(collection);

        rules.cloned()
    });

    match rule {
        None => Err(msg_db_collection_not_found(collection)),
        Some(rule) => Ok(rule),
    }
}

// ---------------------------------------------------------
// Config
// ---------------------------------------------------------

pub fn get_config() -> Option<DbConfig> {
    STATE.with(|state| state.borrow().heap.db.config.clone())
}

pub fn insert_config(config: &DbConfig) {
    STATE.with(|state| insert_config_impl(config, &mut state.borrow_mut().heap.db))
}

fn insert_config_impl(config: &DbConfig, state: &mut DbHeapState) {
    state.config = Some(config.clone());
}

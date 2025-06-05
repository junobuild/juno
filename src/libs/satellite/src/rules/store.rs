use crate::assets::storage::store::assert_assets_collection_empty_store;
use crate::db::store::{delete_collection_store, init_collection_store};
use crate::memory::internal::STATE;
use crate::storage::store::assert_assets_collection_empty_store;
use junobuild_collections::store::{del_rule, filter_rules, set_rule};
use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::interface::{DelRule, SetRule};
use junobuild_collections::types::rules::{Memory, Rule};
// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn get_rule_db(collection: &CollectionKey) -> Option<Rule> {
    STATE.with(|state| state.borrow().heap.db.rules.get(collection).cloned())
}

pub fn get_rule_storage(collection: &CollectionKey) -> Option<Rule> {
    STATE.with(|state| state.borrow().heap.storage.rules.get(collection).cloned())
}

pub fn get_rules_db() -> Vec<(CollectionKey, Rule)> {
    STATE.with(|state| state.borrow().heap.db.rules.clone().into_iter().collect())
}

pub fn get_rules_storage() -> Vec<(CollectionKey, Rule)> {
    STATE.with(|state| {
        state
            .borrow()
            .heap
            .storage
            .rules
            .clone()
            .into_iter()
            .collect()
    })
}

pub fn set_rule_db(collection: CollectionKey, rule: SetRule) -> Result<Rule, String> {
    let rule = STATE.with(|state| {
        set_rule(
            collection.clone(),
            rule.clone(),
            false,
            &mut state.borrow_mut().heap.db.rules,
        )
    })?;

    // If the collection does not exist yet we initialize it
    init_collection_store(&collection, &rule.memory.clone().unwrap_or(Memory::Stable));

    Ok(rule)
}

pub fn set_rule_storage(collection: CollectionKey, rule: SetRule) -> Result<Rule, String> {
    STATE.with(|state| {
        set_rule(
            collection,
            rule,
            true,
            &mut state.borrow_mut().heap.storage.rules,
        )
    })
}

pub fn del_rule_db(collection: CollectionKey, rule: DelRule) -> Result<(), String> {
    // We delete the empty collection first.
    delete_collection_store(&collection)?;

    STATE.with(|state| {
        del_rule(
            collection.clone(),
            rule,
            &mut state.borrow_mut().heap.db.rules,
        )
    })?;

    Ok(())
}

pub fn del_rule_storage(collection: CollectionKey, rule: DelRule) -> Result<(), String> {
    // Only unused rule can be removed
    assert_assets_collection_empty_store(&collection)?;

    STATE.with(|state| del_rule(collection, rule, &mut state.borrow_mut().heap.storage.rules))
}

use crate::db::store::{delete_collection_store, init_collection_store};
use crate::memory::STATE;
use crate::rules::assert_rules::{
    assert_memory, assert_mutable_permissions, assert_write_permission,
};
use crate::rules::constants::SYS_COLLECTION_PREFIX;
use crate::rules::types::interface::{DelRule, SetRule};
use crate::rules::types::rules::{Memory, Rule, Rules};
use crate::storage::store::assert_assets_collection_empty_store;
use crate::types::core::CollectionKey;
use ic_cdk::api::time;

/// Rules

pub fn get_rules_db() -> Vec<(CollectionKey, Rule)> {
    STATE.with(|state| get_rules(&state.borrow().heap.db.rules))
}

pub fn get_rules_storage() -> Vec<(CollectionKey, Rule)> {
    STATE.with(|state| get_rules(&state.borrow().heap.storage.rules))
}

fn get_rules(rules: &Rules) -> Vec<(CollectionKey, Rule)> {
    rules
        .clone()
        .into_iter()
        .filter(|(path, _rules)| (path.starts_with(|c| c != SYS_COLLECTION_PREFIX)))
        .collect()
}

pub fn set_rule_db(collection: CollectionKey, rule: SetRule) -> Result<(), String> {
    STATE.with(|state| {
        set_rule_impl(
            collection.clone(),
            rule.clone(),
            Memory::Heap,
            &mut state.borrow_mut().heap.db.rules,
        )
    })?;

    // If the collection does not exist yet we initialize it
    init_collection_store(&collection, &rule.memory.unwrap_or(Memory::Heap));

    Ok(())
}

pub fn set_rule_storage(collection: CollectionKey, rule: SetRule) -> Result<(), String> {
    STATE.with(|state| {
        set_rule_impl(
            collection,
            rule,
            Memory::Stable,
            &mut state.borrow_mut().heap.storage.rules,
        )
    })
}

pub fn del_rule_db(collection: CollectionKey, rule: DelRule) -> Result<(), String> {
    // We delete the empty collection first.
    delete_collection_store(&collection)?;

    STATE.with(|state| {
        del_rule_impl(
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

    STATE.with(|state| del_rule_impl(collection, rule, &mut state.borrow_mut().heap.storage.rules))
}

fn set_rule_impl(
    collection: CollectionKey,
    user_rule: SetRule,
    default_memory: Memory,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    assert_write_permission(&collection, current_rule, &user_rule.updated_at)?;
    assert_memory(current_rule, &user_rule.memory)?;
    assert_mutable_permissions(current_rule, &user_rule)?;

    let now = time();

    let created_at: u64 = match current_rule {
        None => now,
        Some(current_rule) => current_rule.created_at,
    };

    let updated_at: u64 = now;

    let rule: Rule = Rule {
        created_at,
        updated_at,
        read: user_rule.read,
        write: user_rule.write,
        memory: Some(user_rule.memory.unwrap_or(default_memory)),
        mutable_permissions: Some(user_rule.mutable_permissions.unwrap_or(true)),
        max_size: user_rule.max_size,
    };

    rules.insert(collection, rule);

    Ok(())
}

fn del_rule_impl(
    collection: CollectionKey,
    user_rule: DelRule,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    assert_write_permission(&collection, current_rule, &user_rule.updated_at)?;

    rules.remove(&collection);

    Ok(())
}

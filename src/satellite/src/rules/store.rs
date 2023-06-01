use crate::db::store::{delete_collection, init_collection};
use crate::rules::constants::SYS_COLLECTION_PREFIX;
use crate::rules::types::interface::{DelRule, SetRule};
use crate::rules::types::rules::{Rule, Rules};
use crate::storage::store::assert_assets_collection_empty;
use crate::types::core::CollectionKey;
use crate::STATE;
use ic_cdk::api::time;
use shared::assert::assert_timestamp;

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
            rule,
            &mut state.borrow_mut().heap.db.rules,
        )
    })?;

    // If the collection does not exist yet we initialize it
    init_collection(collection);

    Ok(())
}

pub fn set_rule_storage(collection: CollectionKey, rule: SetRule) -> Result<(), String> {
    STATE.with(|state| set_rule_impl(collection, rule, &mut state.borrow_mut().heap.storage.rules))
}

pub fn del_rule_db(collection: CollectionKey, rule: DelRule) -> Result<(), String> {
    // We delete the empty collection first.
    delete_collection(collection.clone())?;

    STATE.with(|state| del_rule_impl(collection, rule, &mut state.borrow_mut().heap.db.rules))?;

    Ok(())
}

pub fn del_rule_storage(collection: CollectionKey, rule: DelRule) -> Result<(), String> {
    // Only unused rule can be removed
    assert_assets_collection_empty(collection.clone())?;

    STATE.with(|state| del_rule_impl(collection, rule, &mut state.borrow_mut().heap.storage.rules))
}

fn set_rule_impl(
    collection: CollectionKey,
    user_rule: SetRule,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    match assert_write_permission(&collection, current_rule, &user_rule.updated_at) {
        Ok(_) => (),
        Err(e) => {
            return Err(e);
        }
    }

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

    match assert_write_permission(&collection, current_rule, &user_rule.updated_at) {
        Ok(_) => (),
        Err(e) => {
            return Err(e);
        }
    }

    rules.remove(&collection);

    Ok(())
}

fn assert_write_permission(
    collection: &CollectionKey,
    current_rule: Option<&Rule>,
    updated_at: &Option<u64>,
) -> Result<(), String> {
    // Validate timestamp
    match current_rule {
        None => (),
        Some(current_rule) => match assert_timestamp(*updated_at, current_rule.updated_at) {
            Ok(_) => (),
            Err(e) => {
                return Err(e);
            }
        },
    }

    if collection.starts_with(|c| c == SYS_COLLECTION_PREFIX) {
        return Err(format!(
            "Collection starts with {}, a reserved prefix",
            SYS_COLLECTION_PREFIX
        ));
    }

    Ok(())
}

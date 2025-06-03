use crate::assert::rules::{
    assert_memory, assert_mutable_permissions, assert_storage_reserved_collection,
    assert_system_collection_delete_permission, assert_system_collection_set_permission,
    assert_write_version,
};
use crate::types::core::CollectionKey;
use crate::types::interface::{DelRule, SetRule};
use crate::types::rules::{Rule, Rules};

// ---------------------------------------------------------
// Rules
// ---------------------------------------------------------

pub fn set_rule(
    collection: CollectionKey,
    user_rule: SetRule,
    storage_checks: bool,
    rules: &mut Rules,
) -> Result<Rule, String> {
    let current_rule = rules.get(&collection);

    assert_write_version(current_rule, &user_rule.version)?;

    assert_system_collection_set_permission(&collection, current_rule, &user_rule)?;

    if storage_checks {
        assert_storage_reserved_collection(&collection, rules)?;
    }

    assert_memory(current_rule, &user_rule.memory)?;
    assert_mutable_permissions(current_rule, &user_rule)?;

    let rule: Rule = Rule::prepare(&collection, &current_rule, &user_rule)?;

    rules.insert(collection, rule.clone());

    Ok(rule)
}

pub fn del_rule(
    collection: CollectionKey,
    user_rule: DelRule,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    assert_write_version(current_rule, &user_rule.version)?;

    assert_system_collection_delete_permission(&collection)?;

    rules.remove(&collection);

    Ok(())
}

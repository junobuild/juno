use crate::assert_rules::{assert_memory, assert_mutable_permissions, assert_write_permission};
use crate::constants::SYS_COLLECTION_PREFIX;
use crate::types::core::CollectionKey;
use crate::types::interface::{DelRule, SetRule};
use crate::types::rules::{Rule, Rules};

/// Rules

pub fn filter_rules(rules: &Rules) -> Vec<(CollectionKey, Rule)> {
    rules
        .clone()
        .into_iter()
        .filter(|(path, _rules)| (path.starts_with(|c| c != SYS_COLLECTION_PREFIX)))
        .collect()
}

pub fn set_rule(
    collection: CollectionKey,
    user_rule: SetRule,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    assert_write_permission(&collection, current_rule, &user_rule.version)?;
    assert_memory(current_rule, &user_rule.memory)?;
    assert_mutable_permissions(current_rule, &user_rule)?;

    let rule: Rule = Rule::prepare(&current_rule, &user_rule);

    rules.insert(collection, rule);

    Ok(())
}

pub fn del_rule(
    collection: CollectionKey,
    user_rule: DelRule,
    rules: &mut Rules,
) -> Result<(), String> {
    let current_rule = rules.get(&collection);

    assert_write_permission(&collection, current_rule, &user_rule.version)?;

    rules.remove(&collection);

    Ok(())
}

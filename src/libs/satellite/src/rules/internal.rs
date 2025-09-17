use junobuild_collections::types::core::CollectionKey;
use junobuild_collections::types::rules::{Rule, Rules};
use crate::memory::internal::STATE;

/// Inserts or updates a rule directly in the state.
///
/// ⚠️ **Warning:** This function is for internal use only and does not perform any assertions.
///
pub fn unsafe_set_rule(collection: &CollectionKey, rule: &Rule) {
    STATE.with(|state| {
        set_rule_impl(
            collection,
            rule,
            &mut state.borrow_mut().heap.storage.rules,
        )
    })
}

fn set_rule_impl(collection: &CollectionKey,
                 rule: &Rule,
                 rules: &mut Rules,) {
    rules.insert(collection.clone(), rule.clone());
}
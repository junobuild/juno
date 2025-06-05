use crate::assets::constants::{
    CDN_JUNO_RELEASES_COLLECTION_KEY, DEFAULT_CDN_JUNO_RELEASES_COLLECTIONS,
};
use crate::memory::internal::STATE;
use ic_cdk::api::time;
use junobuild_collections::types::interface::SetRule;
use junobuild_collections::types::rules::{Memory, Rule, Rules};

// TODO: One time upgrade - To be removed.

// Adds the new collection reserved for juno. Useful for the CDN to handle releases.
pub fn init_juno_collection() {
    STATE.with(|state| {
        let rules = &mut state.borrow_mut().heap.storage.rules;

        if !rules.contains_key(CDN_JUNO_RELEASES_COLLECTION_KEY) {
            init_juno_collection_impl(rules);
        }
    });
}

fn init_juno_collection_impl(rules: &mut Rules) {
    let now = time();

    let cdn_set_rule: SetRule = DEFAULT_CDN_JUNO_RELEASES_COLLECTIONS[0].1.clone();

    let cdn_rule: Rule = Rule {
        read: cdn_set_rule.read,
        write: cdn_set_rule.write,
        memory: Some(cdn_set_rule.memory.unwrap_or(Memory::Heap)),
        mutable_permissions: Some(cdn_set_rule.mutable_permissions.unwrap_or(false)),
        max_size: cdn_set_rule.max_size,
        max_capacity: cdn_set_rule.max_capacity,
        max_changes_per_user: cdn_set_rule.max_changes_per_user,
        created_at: now,
        updated_at: now,
        version: cdn_set_rule.version,
        rate_config: cdn_set_rule.rate_config,
    };

    rules.insert(CDN_JUNO_RELEASES_COLLECTION_KEY.to_string(), cdn_rule);
}

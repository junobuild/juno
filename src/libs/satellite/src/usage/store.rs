use crate::memory::STATE;
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::{UserUsage, UserUsageKey, UserUsageStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

pub fn increase_user_usage(user_id: &UserId, collection: &CollectionKey) {
    update_user_usage(user_id, collection, &ModificationType::Set, None);
}

pub fn decrease_user_usage(user_id: &UserId, collection: &CollectionKey) {
    update_user_usage(user_id, collection, &ModificationType::Delete, None);
}

pub fn decrease_user_usage_by(user_id: &UserId, collection: &CollectionKey, count: u32) {
    update_user_usage(user_id, collection, &ModificationType::Delete, Some(count));
}

fn update_user_usage(
    user_id: &UserId,
    collection: &CollectionKey,
    modification: &ModificationType,
    count: Option<u32>,
) {
    STATE.with(|state| {
        update_user_usage_impl(
            user_id,
            collection,
            modification,
            count,
            &mut state.borrow_mut().stable.user_usage,
        )
    })
}

fn update_user_usage_impl(
    user_id: &UserId,
    collection: &CollectionKey,
    modification: &ModificationType,
    count: Option<u32>,
    state: &mut UserUsageStable,
) {
    let key = stable_user_usage_key(user_id, collection);

    let current_usage = state.get(&key);

    let update_usage = UserUsage::update(&current_usage, modification, count);

    state.insert(key, update_usage);
}

fn stable_user_usage_key(user_id: &UserId, collection: &CollectionKey) -> UserUsageKey {
    UserUsageKey {
        user_id: *user_id,
        collection: collection.clone(),
    }
}

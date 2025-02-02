use crate::memory::STATE;
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::{UserUsage, UserUsageKey, UserUsageStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

pub fn get_user_usage(user_id: &UserId, collection: &CollectionKey) -> Option<UserUsage> {
    STATE.with(|state| get_user_usage_impl(user_id, collection, &state.borrow().stable.user_usage))
}

pub fn update_user_usage(
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

fn get_user_usage_impl(
    user_id: &UserId,
    collection: &CollectionKey,
    state: &UserUsageStable,
) -> Option<UserUsage> {
    let key = UserUsageKey::new(user_id, collection);

    state.get(&key)
}

fn update_user_usage_impl(
    user_id: &UserId,
    collection: &CollectionKey,
    modification: &ModificationType,
    count: Option<u32>,
    state: &mut UserUsageStable,
) {
    let key = UserUsageKey::new(user_id, collection);

    let current_usage = state.get(&key);

    let update_usage = UserUsage::update(&current_usage, modification, count);

    state.insert(key, update_usage);
}

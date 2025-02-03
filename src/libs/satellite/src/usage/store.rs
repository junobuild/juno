use crate::memory::STATE;
use crate::types::state::CollectionType;
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::{UserUsage, UserUsageKey, UserUsageStable};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

pub fn get_user_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
) -> Option<UserUsage> {
    STATE.with(|state| {
        get_user_usage_impl(
            collection_key,
            collection_type,
            user_id,
            &state.borrow().stable.user_usage,
        )
    })
}

pub fn update_user_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
    modification: &ModificationType,
    count: Option<u32>,
) -> UserUsage {
    STATE.with(|state| {
        update_user_usage_impl(
            collection_key,
            collection_type,
            user_id,
            modification,
            count,
            &mut state.borrow_mut().stable.user_usage,
        )
    })
}

pub fn set_user_usage(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
    count: u32,
) -> UserUsage {
    STATE.with(|state| {
        set_user_usage_impl(
            collection_key,
            collection_type,
            user_id,
            count,
            &mut state.borrow_mut().stable.user_usage,
        )
    })
}

fn get_user_usage_impl(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
    state: &UserUsageStable,
) -> Option<UserUsage> {
    let key = UserUsageKey::create(user_id, collection_key, collection_type);

    state.get(&key)
}

fn update_user_usage_impl(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
    modification: &ModificationType,
    count: Option<u32>,
    state: &mut UserUsageStable,
) -> UserUsage {
    let key = UserUsageKey::create(user_id, collection_key, collection_type);

    let current_usage = state.get(&key);

    let update_usage = UserUsage::increase_or_decrease(&current_usage, modification, count);

    state.insert(key, update_usage.clone());

    update_usage
}

fn set_user_usage_impl(
    collection_key: &CollectionKey,
    collection_type: &CollectionType,
    user_id: &UserId,
    count: u32,
    state: &mut UserUsageStable,
) -> UserUsage {
    let key = UserUsageKey::create(user_id, collection_key, collection_type);

    let current_usage = state.get(&key);

    let update_usage = UserUsage::set(&current_usage, count);

    state.insert(key, update_usage.clone());

    update_usage
}

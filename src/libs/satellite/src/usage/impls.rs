use crate::types::interface::CollectionType;
use crate::usage::types::interface::ModificationType;
use crate::usage::types::state::{UserUsage, UserUsageKey};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::constants::INITIAL_VERSION;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::{Timestamp, UserId, Version};
use std::borrow::Cow;

impl Storable for UserUsage {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for UserUsageKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl UserUsage {
    pub fn update(
        current_user_usage: &Option<UserUsage>,
        modification: &ModificationType,
        count: Option<u32>,
    ) -> Self {
        let now = time();
        let count = count.unwrap_or(1);

        // User usage for the collection

        let items_count: u32 = match current_user_usage {
            None => 1,
            Some(current_user_usage) => match modification {
                ModificationType::Set => current_user_usage.items_count.saturating_add(count),
                ModificationType::Delete => current_user_usage.items_count.saturating_sub(count),
            },
        };

        // Metadata for the UserUsage entity entry

        let created_at: Timestamp = match current_user_usage {
            None => now,
            Some(current_user_usage) => current_user_usage.created_at,
        };

        let version: Version = match current_user_usage {
            None => INITIAL_VERSION,
            Some(current_user_usage) => current_user_usage.version.unwrap_or_default() + 1,
        };

        let updated_at: Timestamp = now;

        UserUsage {
            items_count,
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}

impl UserUsageKey {
    pub fn new(
        user_id: &UserId,
        collection_key: &CollectionKey,
        collection_type: &CollectionType,
    ) -> Self {
        Self {
            user_id: *user_id,
            collection_key: collection_key.clone(),
            collection_type: collection_type.clone(),
        }
    }
}

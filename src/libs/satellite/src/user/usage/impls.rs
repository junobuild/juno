use crate::types::state::CollectionType;
use crate::user::usage::types::state::{UserUsageData, UserUsageKey};
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::UserId;

impl UserUsageData {
    pub fn increment(current_user_usage: &Option<UserUsageData>) -> Self {
        let count = 1;

        let items_count: u32 = match current_user_usage {
            None => count,
            Some(current_user_usage) => current_user_usage.changes_count.saturating_add(count),
        };

        UserUsageData {
            changes_count: items_count,
        }
    }
}

impl UserUsageKey {
    pub fn create(
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

    pub fn to_key(&self) -> String {
        format!(
            "{}#{}#{}",
            self.user_id.to_text(),
            self.collection_type,
            self.collection_key
        )
    }
}

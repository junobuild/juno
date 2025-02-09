use crate::usage::types::state::{UserUsage, UserUsageKey};
use ic_cdk::api::time;
use junobuild_collections::types::core::CollectionKey;
use junobuild_shared::types::state::{Timestamp, UserId, Version, Versioned};
use junobuild_shared::version::next_version;
use crate::types::state::CollectionType;

impl UserUsage {
    pub fn increment(current_user_usage: &Option<UserUsage>) -> Self {
        let count = 1;

        // User usage for the collection

        let items_count: u32 = match current_user_usage {
            None => count,
            Some(current_user_usage) => current_user_usage.changes_count.saturating_add(count),
        };

        UserUsage::apply_update(current_user_usage, items_count)
    }

    fn apply_update(current_user_usage: &Option<UserUsage>, items_count: u32) -> Self {
        let now = time();

        // Metadata for the UserUsage entity entry

        let created_at: Timestamp = match current_user_usage {
            None => now,
            Some(current_user_usage) => current_user_usage.created_at,
        };

        let version = next_version(current_user_usage);

        let updated_at: Timestamp = now;

        UserUsage {
            changes_count: items_count,
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}

impl Versioned for UserUsage {
    fn version(&self) -> Option<Version> {
        self.version
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

    pub fn to_key(
        &self
    ) -> String {
        format!("{}#{}#{}", self.user_id.to_text(), self.collection_type, self.collection_key)
    }
}

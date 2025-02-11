pub mod state {
    use crate::types::state::CollectionType;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::state::UserId;
    use serde::{Deserialize, Serialize};

    /// A unique key for identifying user usage within a collection.
    /// The key will be parsed to `user-id#db|storage#collection`.
    #[derive(Serialize, Deserialize)]
    pub struct UserUsageKey {
        pub user_id: UserId,
        pub collection_key: CollectionKey,
        pub collection_type: CollectionType,
    }

    /// Tracks the usage (create, set and delete) of a user in a collection.
    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserUsageData {
        pub changes_count: u32,
    }
}

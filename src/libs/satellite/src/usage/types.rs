pub mod state {
    use crate::types::state::CollectionType;
    use candid::CandidType;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::state::UserId;
    use serde::{Deserialize, Serialize};

    /// A unique key for identifying user usage within a collection.
    ///
    /// It consists of:
    /// - `user_id`: The unique identifier for the user which is matched to the caller.
    /// - `collection_key`: The collection where usage is tracked.
    /// - `collection_type`: The type of collection (`Db` for datastore, `Storage` for assets).
    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct UserUsageKey {
        pub user_id: UserId,
        pub collection_key: CollectionKey,
        pub collection_type: CollectionType,
    }

    /// Tracks the usage (create, set and delete) of a user in a collection.
    ///
    ///
    /// Fields:
    /// - `changes_count`: The total number of changes (create/update/delete) by the user.
    /// - `created_at`: The timestamp when this user usage entry was first recorded.
    /// - `updated_at`: The timestamp of the last update to this user usage entry.
    /// - `version`: An optional field representing the version of this usage entry. In the future we might implement checks to avoid overwrite but, this is not the case currently.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UserUsageData {
        pub changes_count: u32,
    }
}

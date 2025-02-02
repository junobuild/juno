pub mod state {
    use crate::types::interface::CollectionType;
    use candid::{CandidType, Deserialize};
    use ic_stable_structures::StableBTreeMap;
    use junobuild_collections::types::core::CollectionKey;
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Timestamp, UserId, Version};
    use serde::Serialize;

    pub type UserUsageStable = StableBTreeMap<UserUsageKey, UserUsage, Memory>;

    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct UserUsageKey {
        pub user_id: UserId,
        pub collection_key: CollectionKey,
        pub collection_type: CollectionType,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UserUsage {
        pub items_count: u32,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }
}

pub mod interface {
    pub enum ModificationType {
        Set,
        Delete,
    }
}

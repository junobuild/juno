pub mod upgrade {
    use crate::db::types::state::DbHeap;
    use crate::rules::types::rules::Permission;
    use crate::storage::types::state::StorageHeapState;
    use crate::types::core::CollectionKey;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use shared::types::state::Controllers;
    use std::collections::HashMap;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub db: UpgradeDbHeapState,
        pub storage: StorageHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeDbHeapState {
        pub db: DbHeap,
        pub rules: UpgradeRules,
    }

    pub type UpgradeRules = HashMap<CollectionKey, UpgradeRule>;

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct UpgradeRule {
        pub read: Permission,
        pub write: Permission,
        pub max_size: Option<u128>,
        pub created_at: u64,
        pub updated_at: u64,
    }
}

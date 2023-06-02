pub mod upgrade {
    use crate::db::types::state::DbHeap;
    use crate::rules::types::rules::Permission;
    use crate::types::core::CollectionKey;
    use candid::CandidType;
    use serde::{Deserialize, Serialize};
    use shared::types::state::Controllers;
    use std::collections::HashMap;
    use crate::storage::types::config::StorageConfig;
    use crate::storage::types::domain::CustomDomains;
    use crate::storage::types::state::Assets;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub db: UpgradeDbHeapState,
        pub storage: UpgradeStorageHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeDbHeapState {
        pub db: DbHeap,
        pub rules: UpgradeRules,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeStorageHeapState {
        pub assets: Assets,
        pub rules: UpgradeRules,
        pub config: StorageConfig,
        pub custom_domains: CustomDomains,
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

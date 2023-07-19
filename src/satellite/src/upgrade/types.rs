pub mod upgrade {
    use crate::db::types::state::DbHeapState;
    use crate::rules::types::rules::Rules;
    use crate::storage::types::config::StorageConfig;
    use crate::storage::types::domain::CustomDomains;
    use crate::storage::types::state::Assets;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub db: DbHeapState,
        pub storage: UpgradeStorageHeapState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStorageHeapState {
        pub assets: Assets,
        pub rules: Rules,
        pub config: StorageConfig,
        pub custom_domains: CustomDomains,
    }
}

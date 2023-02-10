///
/// Breaking changes:
///
/// v0.0.1 -> v0.0.2
///
/// CustomDomain.bn_id from String to Option<String>
///
pub mod upgrade {
    use candid::CandidType;
    use serde::Deserialize;
    use std::collections::HashMap;
    use shared::types::interface::Controllers;
    use crate::db::types::state::DbStableState;
    use crate::rules::types::rules::Rules;
    use crate::storage::types::config::StorageConfig;
    use crate::storage::types::domain::DomainName;
    use crate::storage::types::state::Assets;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub db: DbStableState,
        pub storage: UpgradeStorageStableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStorageStableState {
        pub assets: Assets,
        pub rules: Rules,
        pub config: StorageConfig,
        pub custom_domains: UpgradeCustomDomains,
    }

    pub type UpgradeCustomDomains = HashMap<DomainName, UpgradeCustomDomain>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct UpgradeCustomDomain {
        pub bn_id: String,
        pub created_at: u64,
        pub updated_at: u64,
    }
}
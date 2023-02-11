///
/// Breaking changes:
///
/// v0.0.1 -> v0.0.3
///
/// - CustomDomain.bn_id from String to Option<String>
/// - StorageConfig.trailing_slash deprecated
///
pub mod upgrade {
    use crate::db::types::state::DbStableState;
    use crate::rules::types::rules::Rules;
    use crate::storage::types::domain::DomainName;
    use crate::storage::types::state::Assets;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::interface::Controllers;
    use std::collections::HashMap;

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
        pub config: UpgradeStorageConfig,
        pub custom_domains: UpgradeCustomDomains,
    }

    pub type UpgradeCustomDomains = HashMap<DomainName, UpgradeCustomDomain>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct UpgradeCustomDomain {
        pub bn_id: String,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStorageConfig {
        pub trailing_slash: UpgradeTrailingSlash,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub enum UpgradeTrailingSlash {
        Never,
        Always,
    }
}

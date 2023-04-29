pub mod upgrade {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::StorageStableState;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::upgrade::UpgradeControllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: UpgradeControllers,
        pub db: DbStableState,
        pub storage: StorageStableState,
    }
}

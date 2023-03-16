///
/// Upgrade structure:
///
/// v0.0.5 -> v0.0.6
///
pub mod upgrade {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::StorageStableState;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::UserId;
    use std::collections::HashSet;

    pub type UpgradeControllers = HashSet<UserId>;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: UpgradeControllers,
        pub db: DbStableState,
        pub storage: StorageStableState,
    }
}

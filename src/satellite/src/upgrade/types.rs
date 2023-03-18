///
/// Upgrade structure:
///
/// v0.0.5 -> v0.0.x
///
pub mod upgrade {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::StorageStableState;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub db: DbStableState,
        pub storage: StorageStableState,
    }
}

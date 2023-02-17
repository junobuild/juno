///
/// Upgrade structure:
///
/// v0.0.3 -> v0.0.4
///
pub mod upgrade {
    use crate::db::types::state::DbStableState;
    use crate::storage::types::state::StorageStableState;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::interface::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub db: DbStableState,
        pub storage: StorageStableState,
    }
}

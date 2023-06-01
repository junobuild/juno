pub mod upgrade {
    use crate::db::types::state::DbHeapState;
    use crate::storage::types::state::StorageHeapState;
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub controllers: Controllers,
        pub db: DbHeapState,
        pub storage: StorageHeapState,
    }
}

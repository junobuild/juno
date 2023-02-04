pub mod state {
    use candid::{CandidType, Deserialize};
    use ic_ledger_types::{AccountIdentifier, BlockIndex};
    use shared::types::interface::{MissionControlId, UserId};
    use shared::types::ledger::Transactions;
    use std::collections::HashMap;

    pub type MissionControls = HashMap<MissionControlId, MissionControl>;
    pub type MissionControlsTransactions = HashMap<AccountIdentifier, Transactions>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        pub mission_controls: MissionControls,
        pub transactions: MissionControlsTransactions,
        pub cron: Cron,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct MissionControl {
        pub mission_control_id: MissionControlId,
        pub owner: UserId,
        // A vector in case of multiple subaccounts in the future
        pub account_identifiers: Vec<AccountIdentifier>,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Cron {
        pub block_index_synced_up_to: Option<BlockIndex>,
    }
}

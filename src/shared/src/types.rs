pub mod state {
    use candid::CandidType;
    use candid::Principal;
    use serde::Deserialize;
    use std::collections::HashMap;

    pub type UserId = Principal;
    pub type MissionControlId = Principal;
    pub type ControllerId = Principal;

    pub type Metadata = HashMap<String, String>;

    pub type Controllers = HashMap<UserId, Controller>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Controller {
        pub controller_id: ControllerId,
        pub metadata: Metadata,
        pub created_at: u64,
        pub updated_at: u64,
    }
}

pub mod interface {
    use crate::types::state::UserId;
    use candid::CandidType;
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;

    #[derive(CandidType, Deserialize)]
    pub struct CreateSatelliteArgs {
        pub user: UserId,
        pub block_index: Option<BlockIndex>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct GetCreateSatelliteFeeArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct MissionControlArgs {
        pub user: UserId,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SatelliteArgs {
        pub controllers: Vec<UserId>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct ControllersArgs {
        pub controllers: Vec<UserId>,
    }
}

pub mod ledger {
    use candid::CandidType;
    use serde::Deserialize;

    use ic_ledger_types::{Block, BlockIndex, Memo, Operation, Timestamp};

    pub type BlockIndexed = (BlockIndex, Block);
    pub type Blocks = Vec<BlockIndexed>;
    pub type Transactions = Vec<Transaction>;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct Transaction {
        pub block_index: BlockIndex,
        pub memo: Memo,
        pub operation: Option<Operation>,
        pub timestamp: Timestamp,
    }
}

pub mod ic {
    pub struct WasmArg {
        pub wasm: Vec<u8>,
        pub install_arg: Vec<u8>,
    }
}

pub mod cmc {
    use candid::{CandidType, Principal};
    use ic_ledger_types::BlockIndex;
    use serde::Deserialize;

    pub type Cycles = u128;

    #[derive(CandidType, Deserialize)]
    pub enum NotifyError {
        Refunded {
            reason: String,
            block_index: Option<BlockIndex>,
        },
        InvalidTransaction(String),
        TransactionTooOld(BlockIndex),
        Processing,
        Other {
            error_code: u64,
            error_message: String,
        },
    }

    #[derive(CandidType, Deserialize)]
    pub struct TopUpCanisterArgs {
        pub block_index: BlockIndex,
        pub canister_id: Principal,
    }
}

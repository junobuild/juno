pub mod cmc {
    use candid::{CandidType, Principal};
    use ic_cdk::management_canister::{CanisterId, CanisterSettings};
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

    #[derive(CandidType, Deserialize)]
    pub enum CreateCanisterError {
        Refunded {
            refund_amount: u128,
            create_error: String,
        },
    }

    pub type CreateCanisterResult = Result<CanisterId, CreateCanisterError>;

    #[derive(CandidType, Deserialize)]
    pub struct SubnetFilter {
        pub subnet_type: Option<String>,
    }

    pub type SubnetId = Principal;

    #[derive(CandidType, Deserialize)]
    pub enum SubnetSelection {
        /// Choose a random subnet that satisfies the specified properties
        Filter(SubnetFilter),
        /// Choose a specific subnet
        Subnet { subnet: SubnetId },
    }

    #[derive(CandidType, Deserialize)]
    pub struct CreateCanister {
        #[deprecated(note = "use subnet_selection instead")]
        pub subnet_type: Option<String>,
        pub subnet_selection: Option<SubnetSelection>,
        pub settings: Option<CanisterSettings>,
    }
}

pub mod ic {
    use crate::types::core::Blob;
    use candid::{Nat, Principal};

    pub struct WasmArg {
        pub wasm: Blob,
        pub install_arg: Vec<u8>,
    }

    pub struct CreateCanisterInitSettingsArg {
        pub controllers: Vec<Principal>,
        pub freezing_threshold: Nat,
    }
}

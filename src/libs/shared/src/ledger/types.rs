pub mod icp {
    use ic_ledger_types::{Block, BlockIndex};

    pub type BlockIndexed = (BlockIndex, Block);
    pub type Blocks = Vec<BlockIndexed>;
}

pub mod icrc {
    use icrc_ledger_types::icrc1::transfer::{BlockIndex, TransferError};
    use icrc_ledger_types::icrc2::transfer_from::TransferFromError;

    pub type IcrcTransferResult = Result<BlockIndex, TransferError>;
    pub type IcrcTransferFromResult = Result<BlockIndex, TransferFromError>;
}

pub mod cycles {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct CyclesTokens {
        pub e12s: u64,
    }
}

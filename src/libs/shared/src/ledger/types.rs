pub mod icp {
    use ic_ledger_types::{Block, BlockIndex};

    pub type BlockIndexed = (BlockIndex, Block);
    pub type Blocks = Vec<BlockIndexed>;
}

pub mod icrc {
    use icrc_ledger_types::icrc1::transfer::TransferError;

    pub type IcrcTransferResult =
        Result<icrc_ledger_types::icrc1::transfer::BlockIndex, TransferError>;
}

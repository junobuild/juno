pub mod icp {
    use ic_ledger_types::{Block, BlockIndex};

    pub type BlockIndexed = (BlockIndex, Block);
    pub type Blocks = Vec<BlockIndexed>;
}

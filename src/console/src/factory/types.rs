use ic_ledger_types::BlockIndex;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::state::{MissionControlId, UserId};

#[derive(Clone)]
pub enum CanisterCreator {
    User((UserId, Option<MissionControlId>)), // The caller is the owner of the account. The caller comes from the Console UI.
    MissionControl((MissionControlId, UserId)), // The caller is a mission control
}

pub struct CreateCanisterArgs {
    pub block_index: Option<BlockIndex>,
    pub subnet_id: Option<SubnetId>,
}

pub enum FeeKind {
    Cycles,
    ICP,
}

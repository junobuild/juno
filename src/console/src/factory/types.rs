use ic_ledger_types::BlockIndex;
use junobuild_shared::mgmt::types::cmc::SubnetId;
use junobuild_shared::types::state::UserId;

pub struct CreateCanisterArgs {
    pub user: UserId,
    pub block_index: Option<BlockIndex>,
    pub subnet_id: Option<SubnetId>,
}

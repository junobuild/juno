use crate::segments::canister::create_canister;
use crate::segments::store::add_orbiter;
use crate::types::state::Orbiter;
use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use ic_ledger_types::BlockIndex;
use shared::env::CONSOLE;
use shared::types::interface::CreateCanisterArgs;
use shared::types::state::{OrbiterId, UserId};

pub async fn create_orbiter(name: &Option<String>) -> Result<Orbiter, String> {
    create_canister("get_create_orbiter_fee", create_and_save_orbiter, name).await
}

async fn create_and_save_orbiter(
    user: UserId,
    name: Option<String>,
    block_index: Option<BlockIndex>,
) -> Result<Orbiter, String> {
    let console = Principal::from_text(CONSOLE).unwrap();

    let args = CreateCanisterArgs { user, block_index };

    let result: CallResult<(OrbiterId,)> = call(console, "create_orbiter", (args,)).await;

    match result {
        Err((_, message)) => Err(["Create orbiter failed.", &message].join(" - ")),
        Ok((orbiter,)) => Ok(add_orbiter(&orbiter, &name)),
    }
}

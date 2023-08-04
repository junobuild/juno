use candid::Principal;
use shared::types::interface::CreateCanisterArgs;

pub async fn create_orbiter(
    console: Principal,
    caller: Principal,
    CreateCanisterArgs { user, block_index }: CreateCanisterArgs,
) -> Result<Principal, String> {
    // TODO
    Ok(console)
}

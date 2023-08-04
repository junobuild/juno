use candid::Principal;
use shared::types::interface::CreateSegmentArgs;

pub async fn create_orbiter(
    console: Principal,
    caller: Principal,
    CreateSegmentArgs { user, block_index }: CreateSegmentArgs,
) -> Result<Principal, String> {
    // TODO
    Ok(console)
}

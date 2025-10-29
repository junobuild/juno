use crate::auth::delegation;
use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::delegation::types::{GetDelegationResult, OpenIdGetDelegationArgs};
use junobuild_auth::state::get_providers;

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResult, String> {
    let providers = get_providers(&AuthHeap)?;

    let result = delegation::openid_get_delegation(args, &providers);

    Ok(result)
}

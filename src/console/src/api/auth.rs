use crate::auth::authenticate::openid_get_delegation;
use crate::types::interface::GetDelegationArgs;
use ic_cdk_macros::query;
use junobuild_auth::delegation::types::GetDelegationResult;
use junobuild_shared::ic::UnwrapOrTrap;

#[query]
pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResult {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(args).unwrap_or_trap(),
    }
}

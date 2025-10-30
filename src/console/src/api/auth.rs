use crate::auth::authenticate::{openid_authenticate, openid_get_delegation};
use crate::types::interface::{AuthenticationArgs, AuthenticationResult, GetDelegationArgs};
use ic_cdk_macros::{query, update};
use junobuild_auth::delegation::types::GetDelegationResult;
use junobuild_shared::ic::UnwrapOrTrap;

#[update]
async fn authenticate(args: AuthenticationArgs) -> AuthenticationResult {
    match args {
        AuthenticationArgs::OpenId(args) => openid_authenticate(&args).await.unwrap_or_trap(),
    }
}

#[query]
fn get_delegation(args: GetDelegationArgs) -> GetDelegationResult {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(&args).unwrap_or_trap(),
    }
}

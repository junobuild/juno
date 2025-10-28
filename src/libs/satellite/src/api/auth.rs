use crate::auth::authenticate::{openid_authenticate_user, openid_get_delegation};
use crate::types::interface::{AuthenticateUserArgs, AuthenticateUserResult, GetDelegationArgs};
use junobuild_auth::delegation::types::GetDelegationResult;
use junobuild_shared::ic::UnwrapOrTrap;

pub async fn authenticate_user(args: &AuthenticateUserArgs) -> AuthenticateUserResult {
    match args {
        AuthenticateUserArgs::OpenId(args) => openid_authenticate_user(args).await.unwrap_or_trap(),
    }
}

pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResult {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(args).unwrap_or_trap(),
    }
}

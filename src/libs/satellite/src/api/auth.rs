use crate::auth::delegation::{openid_get_delegation, openid_prepare_delegation};
use crate::types::interface::{AuthenticateUserArgs, AuthenticateUserResult, GetDelegationArgs};
use junobuild_auth::delegation::types::GetDelegationResult;
use junobuild_shared::ic::UnwrapOrTrap;

pub fn authenticate_user(args: &AuthenticateUserArgs) -> AuthenticateUserResult {
    match args {
        AuthenticateUserArgs::OpenId(args) => {
            let delegation = openid_prepare_delegation(args).unwrap_or_trap();
            AuthenticateUserResult {
                delegation: delegation.into(),
            }
        }
    }
}

pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResult {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(args).unwrap_or_trap(),
    }
}

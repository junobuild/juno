use crate::auth::delegation::{openid_get_delegation, openid_prepare_delegation};
use crate::types::interface::{GetDelegationArgs, PrepareDelegationArgs};
use junobuild_auth::types::interface::{GetDelegationResponse, PrepareDelegationResponse};
use junobuild_shared::ic::UnwrapOrTrap;

pub fn prepare_delegation(args: &PrepareDelegationArgs) -> PrepareDelegationResponse {
    match args {
        PrepareDelegationArgs::OpenId(args) => openid_prepare_delegation(args).unwrap_or_trap(),
    }
}

pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResponse {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(args).unwrap_or_trap(),
    }
}

use crate::auth::delegation::{openid_get_delegation, openid_prepare_delegation};
use crate::types::interface::{GetDelegationArgs, PrepareDelegationArgs};
use junobuild_auth::delegation::types::{GetDelegationResult, PrepareDelegationResult};
use junobuild_shared::ic::UnwrapOrTrap;

pub fn prepare_delegation(args: &PrepareDelegationArgs) -> PrepareDelegationResult {
    match args {
        PrepareDelegationArgs::OpenId(args) => openid_prepare_delegation(args).unwrap_or_trap(),
    }
}

pub fn get_delegation(args: &GetDelegationArgs) -> GetDelegationResult {
    match args {
        GetDelegationArgs::OpenId(args) => openid_get_delegation(args).unwrap_or_trap(),
    }
}

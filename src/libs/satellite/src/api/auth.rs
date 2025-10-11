use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation;
use junobuild_auth::types::interface::{
    GetDelegationResponse, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationResponse,
};
use junobuild_shared::ic::UnwrapOrTrap;

pub fn prepare_delegation(args: &OpenIdPrepareDelegationArgs) -> PrepareDelegationResponse {
    delegation::openid_prepare_delegation(args, &AuthCertificate).unwrap_or_trap()
}

pub fn get_delegation(args: &OpenIdGetDelegationArgs) -> GetDelegationResponse {
    delegation::openid_get_delegation(args, &AuthCertificate).unwrap_or_trap()
}

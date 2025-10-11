use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation;
use junobuild_auth::types::interface::{
    GetDelegationResponse, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationResponse,
};

pub fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<PrepareDelegationResponse, String> {
    delegation::openid_prepare_delegation(args, &AuthCertificate)
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResponse, String> {
    delegation::openid_get_delegation(args, &AuthCertificate)
}

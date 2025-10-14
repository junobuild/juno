use crate::auth::store::get_config;
use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation;
use junobuild_auth::types::interface::{
    GetDelegationResponse, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationResponse,
};

pub fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<Result<PrepareDelegationResponse, String>, String> {
    let config = get_config().ok_or_else(|| "No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or_else(|| "Authentication with OpenId disabled.")?;

    let result =
        delegation::openid_prepare_delegation(args, &openid.providers, &AuthHeap, &AuthCertificate);
    Ok(result)
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<Result<GetDelegationResponse, String>, String> {
    let config = get_config().ok_or_else(|| "No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or_else(|| "Authentication with OpenId disabled.")?;

    let result =
        delegation::openid_get_delegation(args, &openid.providers, &AuthHeap, &AuthCertificate);
    Ok(result)
}

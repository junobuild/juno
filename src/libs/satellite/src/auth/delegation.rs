use crate::auth::store::get_config;
use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation::types::{
    GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationError, PrepareDelegationResult,
};
use junobuild_auth::{delegation, openid};

// TODO: rename
pub fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<PrepareDelegationResult, String> {
    let config = get_config().ok_or_else(|| "No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or_else(|| "Authentication with OpenId disabled.")?;

    let (client_id, credential) =
        match openid::verify_openid_credentials(&args.jwt, &args.salt, &openid.providers) {
            Ok(value) => value,
            Err(err) => return Ok(Err(PrepareDelegationError::from(err))),
        };

    // TODO: create and assert user

    let result = delegation::openid_prepare_delegation(
        args,
        &client_id,
        &credential,
        &AuthHeap,
        &AuthCertificate,
    );

    Ok(result)
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResult, String> {
    let config = get_config().ok_or_else(|| "No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or_else(|| "Authentication with OpenId disabled.")?;

    let (client_id, credential) =
        match openid::verify_openid_credentials(&args.jwt, &args.salt, &openid.providers) {
            Ok(value) => value,
            Err(err) => return Ok(Err(GetDelegationError::from(err))),
        };

    let result = delegation::openid_get_delegation(
        args,
        &client_id,
        &credential,
        &AuthHeap,
        &AuthCertificate,
    );

    Ok(result)
}

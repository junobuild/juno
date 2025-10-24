use crate::auth::store::get_config;
use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation::types::{
    GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationError, PrepareDelegationResult,
};
use junobuild_auth::{delegation, openid};

// TODO: rename
pub async fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<PrepareDelegationResult, String> {
    // TODO: error labels
    let config = get_config().ok_or("No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or("Authentication with OpenId disabled.")?;

    let (client_id, credential) = match openid::verify_openid_credentials_with_jwks_renewal(
        &args.jwt,
        &args.salt,
        &openid.providers,
        &AuthHeap,
    )
    .await
    {
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
    let config = get_config().ok_or("No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or("Authentication with OpenId disabled.")?;

    let (client_id, credential) = match openid::verify_openid_credentials_with_cached_jwks(
        &args.jwt,
        &args.salt,
        &openid.providers,
        &AuthHeap,
    ) {
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

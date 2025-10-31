use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation::types::{
    GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationError, PreparedDelegation,
};
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_auth::state::types::config::OpenIdProviders;
use junobuild_auth::{delegation, openid};

pub type OpenIdPrepareDelegationResult =
    Result<(PreparedDelegation, OpenIdCredential), PrepareDelegationError>;

pub async fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
    providers: &OpenIdProviders,
) -> OpenIdPrepareDelegationResult {
    let (credential, provider) = match openid::verify_openid_credentials_with_jwks_renewal(
        &args.jwt, &args.salt, providers, &AuthHeap,
    )
    .await
    {
        Ok(value) => value,
        Err(err) => return Err(PrepareDelegationError::from(err)),
    };

    let result = delegation::openid_prepare_delegation(
        &args.session_key,
        &credential,
        &provider,
        &AuthHeap,
        &AuthCertificate,
    );

    result.map(|prepared_delegation| (prepared_delegation, credential))
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
    providers: &OpenIdProviders,
) -> GetDelegationResult {
    let (credential, provider) = match openid::verify_openid_credentials_with_cached_jwks(
        &args.jwt, &args.salt, providers, &AuthHeap,
    ) {
        Ok(value) => value,
        Err(err) => return Err(GetDelegationError::from(err)),
    };

    delegation::openid_get_delegation(
        &args.session_key,
        args.expiration,
        &credential,
        &provider,
        &AuthHeap,
        &AuthCertificate,
    )
}

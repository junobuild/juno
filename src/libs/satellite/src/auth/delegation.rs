use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation;
use junobuild_auth::delegation::types::{
    GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
    PrepareDelegationError, PreparedDelegation,
};
use junobuild_auth::openid::credentials;
use junobuild_auth::openid::credentials::delegation::types::interface::OpenIdCredential;
use junobuild_auth::openid::credentials::delegation::types::provider::OpenIdDelegationProvider;
use junobuild_auth::state::types::config::OpenIdAuthProviders;

pub type OpenIdPrepareDelegationResult = Result<
    (
        PreparedDelegation,
        OpenIdDelegationProvider,
        OpenIdCredential,
    ),
    PrepareDelegationError,
>;

pub async fn openid_prepare_delegation(
    args: &OpenIdPrepareDelegationArgs,
    providers: &OpenIdAuthProviders,
) -> OpenIdPrepareDelegationResult {
    let (credential, provider) =
        match credentials::delegation::verify_openid_credentials_with_jwks_renewal(
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

    result.map(|prepared_delegation| (prepared_delegation, provider, credential))
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
    providers: &OpenIdAuthProviders,
) -> GetDelegationResult {
    let (credential, provider) =
        match credentials::delegation::verify_openid_credentials_with_cached_jwks(
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

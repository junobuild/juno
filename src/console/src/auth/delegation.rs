use crate::auth::strategy_impls::AuthHeap;
use crate::certification::strategy_impls::AuthCertificate;
use junobuild_auth::delegation::types::{
    GetDelegationError, GetDelegationResult, OpenIdGetDelegationArgs,
};
use junobuild_auth::state::types::config::OpenIdProviders;
use junobuild_auth::{delegation, openid};

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
    providers: &OpenIdProviders,
) -> GetDelegationResult {
    let (client_id, credential) = match openid::verify_openid_credentials_with_cached_jwks(
        &args.jwt, &args.salt, providers, &AuthHeap,
    ) {
        Ok(value) => value,
        Err(err) => return Err(GetDelegationError::from(err)),
    };

    delegation::openid_get_delegation(
        &args.session_key,
        &client_id,
        &credential,
        &AuthHeap,
        &AuthCertificate,
    )
}

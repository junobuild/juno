use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::types::OpenIdAuthenticateControllerArgs;
use junobuild_auth::delegation::types::PrepareDelegationError;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_auth::state::get_providers;
use junobuild_auth::{delegation, openid};

pub async fn openid_authenticate_controller(
    args: &OpenIdAuthenticateControllerArgs,
) -> Result<(), String> {
    let providers = get_providers(&AuthHeap)?;

    let (credential, provider) =
        match openid::workload::verify_openid_credentials_with_jwks_renewal(
            &args.jwt,
            &OpenIdProvider::GitHubProxy,
            &AuthHeap,
        )
        .await
        {
            Ok(value) => value,
            Err(err) => return Err(PrepareDelegationError::from(err)),
        };

    Ok(())
}

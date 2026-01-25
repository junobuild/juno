use junobuild_auth::state::get_providers;
use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::types::OpenIdAuthenticateControllerArgs;
use junobuild_auth::{delegation, openid};
use junobuild_auth::delegation::types::PrepareDelegationError;

pub async fn openid_authenticate_controller(
    args: &OpenIdAuthenticateControllerArgs,
) -> Result<(), String> {
    let providers = get_providers(&AuthHeap)?;

    let (credential, provider) = match openid::verify_workload_openid_credentials_with_jwks_renewal(
        &args.jwt, &providers, &AuthHeap,
    )
        .await
    {
        Ok(value) => value,
        Err(err) => return Err(PrepareDelegationError::from(err)),
    };



    Ok(())
}

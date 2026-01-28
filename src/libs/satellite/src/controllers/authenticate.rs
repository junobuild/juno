use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::types::{
    AuthenticateControllerError, OpenIdAuthenticateControllerArgs,
    OpenIdAuthenticateControllerResult,
};
use junobuild_auth::openid;
use junobuild_auth::openid::types::provider::OpenIdProvider;

pub async fn openid_authenticate_controller(
    args: &OpenIdAuthenticateControllerArgs,
) -> Result<OpenIdAuthenticateControllerResult, String> {
    let result = match openid::workload::verify_openid_credentials_with_jwks_renewal(
        &args.jwt,
        &OpenIdProvider::GitHubActions,
        &AuthHeap,
    )
    .await
    {
        Ok(_) => Ok(()),
        Err(err) => Err(AuthenticateControllerError::VerifyOpenIdCredentials(err)),
    };

    Ok(result)
}

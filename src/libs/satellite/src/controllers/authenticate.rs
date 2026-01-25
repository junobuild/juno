use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::types::{AuthenticateControllerError, OpenIdAuthenticateControllerArgs};
use junobuild_auth::openid;
use junobuild_auth::openid::types::provider::OpenIdProvider;

pub type OpenIdAuthenticateControllerResult = Result<(), AuthenticateControllerError>;

pub async fn openid_authenticate_controller(
    args: &OpenIdAuthenticateControllerArgs,
) -> OpenIdAuthenticateControllerResult {
    match openid::workload::verify_openid_credentials_with_jwks_renewal(
        &args.jwt,
        // TODO: GitHubActions
        &OpenIdProvider::GitHubProxy,
        &AuthHeap,
    )
    .await
    {
        Ok(value) => value,
        Err(err) => return Err(AuthenticateControllerError::VerifyOpenIdCredentials(err)),
    };

    Ok(())
}

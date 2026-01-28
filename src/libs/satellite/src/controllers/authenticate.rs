use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::constants::{DEFAULT_CONTROLLER_DURATION_NS, MAX_CONTROLLER_DURATION_NS};
use crate::controllers::store::set_controllers;
use crate::controllers::types::{
    AuthenticateControllerError, OpenIdAuthenticateControllerArgs,
    OpenIdAuthenticateControllerResult,
};
use ic_cdk::api::time;
use junobuild_auth::openid;
use junobuild_auth::openid::types::provider::OpenIdProvider;
use junobuild_shared::segments::controllers::assert_controllers;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::ControllerId;
use std::cmp::min;

pub async fn openid_authenticate_controller(
    args: &OpenIdAuthenticateControllerArgs,
) -> OpenIdAuthenticateControllerResult {
    match openid::automation::verify_openid_credentials_with_jwks_renewal(
        &args.jwt,
        &OpenIdProvider::GitHubActions,
        &AuthHeap,
    )
    .await
    {
        Ok(_) => register_controller(args)
            .map_err(|err| AuthenticateControllerError::RegisterController(err.to_string())),
        Err(err) => Err(AuthenticateControllerError::VerifyOpenIdCredentials(err)),
    }
}

fn register_controller(args: &OpenIdAuthenticateControllerArgs) -> Result<(), String> {
    let controllers: [ControllerId; 1] = [args.controller_id.clone()];

    assert_controllers(&controllers)?;

    // TODO: Assert do not exist

    let expires_at = min(
        args.max_time_to_live
            .unwrap_or(DEFAULT_CONTROLLER_DURATION_NS),
        MAX_CONTROLLER_DURATION_NS,
    );

    let controller: SetController = SetController {
        scope: args.scope.clone().into(),
        metadata: args.metadata.clone(),
        expires_at: Some(time().saturating_add(expires_at)),
    };

    set_controllers(&controllers, &controller);

    Ok(())
}

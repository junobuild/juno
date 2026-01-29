use crate::auth::strategy_impls::AuthHeap;
use junobuild_auth::automation;
use junobuild_auth::automation::types::{
    OpenIdPrepareAutomationArgs, PrepareAutomationError, PreparedAutomation, PreparedDelegation,
};
use junobuild_auth::openid::credentials;
use junobuild_auth::openid::credentials::delegation::types::interface::OpenIdCredential;
use junobuild_auth::openid::types::provider::OpenIdDelegationProvider;
use junobuild_auth::state::types::automation::OpenIdAutomationProviders;

pub type OpenIdPrepareAutomationResult = Result<
    (
        PreparedAutomation,
        OpenIdDelegationProvider,
        // TODO: credential
        OpenIdCredential,
    ),
    PrepareAutomationError,
>;

pub async fn openid_prepare_automation(
    args: &OpenIdPrepareAutomationArgs,
    providers: &OpenIdAutomationProviders,
) -> OpenIdPrepareAutomationResult {
    let provider = match credentials::automation::verify_openid_credentials_with_jwks_renewal(
        &args.jwt, providers, &AuthHeap,
    )
    .await
    {
        Ok(value) => value,
        Err(err) => return Err(PrepareAutomationError::from(err)),
    };

    let result = automation::openid_prepare_automation(&args.controller_id, &provider, &AuthHeap);

    result.map(|prepared_delegation| (prepared_delegation, provider, credential))
}

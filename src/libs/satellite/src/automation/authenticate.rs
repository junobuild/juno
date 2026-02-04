use crate::auth::strategy_impls::AuthHeap;
use crate::automation::automation;
use crate::automation::register::register_controller;
use crate::automation::token::services::save_unique_token_jti;
use crate::automation::types::{AuthenticateAutomationResult, AuthenticationAutomationError};
use junobuild_auth::automation::types::OpenIdPrepareAutomationArgs;
use junobuild_auth::state::get_automation_providers;

pub async fn openid_authenticate_automation(
    args: &OpenIdPrepareAutomationArgs,
    // TODO: Result<Result, String>>
) -> Result<AuthenticateAutomationResult, String> {
    let providers = get_automation_providers(&AuthHeap)?;

    // TODO: rate_config of collection?

    let prepared_automation = automation::openid_prepare_automation(args, &providers).await;

    let result = match prepared_automation {
        Ok((automation, provider, credential)) => {
            if let Err(err) = save_unique_token_jti(&automation, &provider, &credential) {
                return Ok(Err(AuthenticationAutomationError::SaveUniqueJtiToken(err)));
            }

            register_controller(&automation);

            Ok(())
        }
        Err(err) => Err(AuthenticationAutomationError::PrepareAutomation(err)),
    };

    Ok(result)
}

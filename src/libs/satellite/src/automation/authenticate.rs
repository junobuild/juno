use crate::auth::strategy_impls::AuthHeap;
use crate::automation::automation;
use crate::automation::types::{AuthenticateAutomationResult, AuthenticationAutomationError};
use crate::controllers::store::set_controllers;
use junobuild_auth::automation::types::{OpenIdPrepareAutomationArgs, PreparedAutomation};
use junobuild_auth::state::get_automation_providers;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::ControllerId;
use std::collections::HashMap;
use crate::automation::register::register_controller;

pub async fn openid_authenticate_automation(
    args: &OpenIdPrepareAutomationArgs,
    // TODO: Result<Result, String>>
) -> Result<AuthenticateAutomationResult, String> {
    let providers = get_automation_providers(&AuthHeap)?;

    // TODO: rate_config of collection?

    let prepared_automation = automation::openid_prepare_automation(args, &providers).await;

    let result = match prepared_automation {
        Ok((automation, _, __)) => {
            register_controller(&automation);
            Ok(())
        }
        Err(err) => Err(AuthenticationAutomationError::PrepareAutomation(err)),
    };

    Ok(result)
}

use crate::auth::strategy_impls::AuthHeap;
use crate::controllers::store::set_controllers;
use crate::controllers::types::{
    AuthenticateAutomationResult, AuthenticationAutomationError,
};
use junobuild_auth::state::{get_automation_providers};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::ControllerId;
use junobuild_auth::automation::types::{OpenIdPrepareAutomationArgs, PreparedAutomation};
use crate::controllers::automation;

pub async fn openid_authenticate_controller(
    args: &OpenIdPrepareAutomationArgs,
    // TODO: Result<Result, String>>
) -> Result<AuthenticateAutomationResult, String> {
    let providers = get_automation_providers(&AuthHeap)?;
    
    // TODO: rate?

    let prepared_automation = automation::openid_prepare_delegation(args, &providers).await;

    let result = match prepared_automation {
        Ok((automation, _ , __)) => {
            register_controller(&automation);
            Ok(())
        }
        Err(err) => Err(AuthenticationAutomationError::PrepareAutomation(err)),
    };

    Ok(result)
}

fn register_controller(prepared_automation: &PreparedAutomation) {
    let controllers: [ControllerId; 1] = [prepared_automation.controller.id.clone()];

    let controller: SetController = SetController {
        scope: prepared_automation.controller.scope.clone().into(),
        metadata: args.metadata.clone(),
        expires_at: Some(prepared_automation.controller.expires_at),
    };

    set_controllers(&controllers, &controller);

    Ok(())
}

use crate::automation::workflow::build_automation_workflow_key;
use crate::controllers::store::set_controllers;
use junobuild_auth::automation::types::PreparedAutomation;
use junobuild_auth::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, ControllerKind, Metadata};

pub fn register_controller(
    automation: &PreparedAutomation,
    provider: &OpenIdAutomationProvider,
    credential: &OpenIdAutomationCredential,
) -> Result<(), String> {
    let PreparedAutomation(controller_id, controller) = automation;

    let controllers: [ControllerId; 1] = [controller_id.clone()];

    let automation_workflow_key = build_automation_workflow_key(provider, credential)?;

    let mut metadata: Metadata = Default::default();
    metadata.insert("workflow_key".to_string(), automation_workflow_key.to_key());

    let controller: SetController = SetController {
        scope: controller.scope.clone().into(),
        metadata,
        expires_at: Some(controller.expires_at),
        kind: Some(ControllerKind::Automation),
    };

    set_controllers(&controllers, &controller);

    Ok(())
}

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
    let controllers: [ControllerId; 1] = [automation.controller.id];

    let automation_workflow_key = build_automation_workflow_key(provider, credential)?;

    let mut metadata: Metadata = Default::default();
    metadata.insert("workflow_key".to_string(), automation_workflow_key.to_key());

    let controller: SetController = SetController {
        scope: automation.controller.scope.clone().into(),
        metadata,
        expires_at: Some(automation.controller.expires_at),
        kind: Some(ControllerKind::Automation),
    };

    set_controllers(&controllers, &controller);

    Ok(())
}

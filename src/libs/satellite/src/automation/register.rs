use std::collections::HashMap;
use junobuild_auth::automation::types::PreparedAutomation;
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::ControllerId;
use crate::controllers::store::set_controllers;

pub fn register_controller(prepared_automation: &PreparedAutomation) {
    let controllers: [ControllerId; 1] = [prepared_automation.controller.id.clone()];

    // TODO: jti in metadata? to know the source?
    let controller: SetController = SetController {
        scope: prepared_automation.controller.scope.clone().into(),
        metadata: HashMap::default(), // TODO args.metadata.clone(),
        expires_at: Some(prepared_automation.controller.expires_at),
        // TODO: type or metadata
    };

    set_controllers(&controllers, &controller);
}


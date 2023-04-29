use crate::types::state::{Controller, ControllerScope, Controllers};
use crate::types::upgrade::UpgradeControllers;

pub fn upgrade_controllers(controllers: UpgradeControllers) -> Controllers {
    let mut new_controllers: Controllers = Controllers::new();

    for (controller_id, controller) in controllers.iter() {
        new_controllers.insert(
            *controller_id,
            Controller {
                metadata: controller.metadata.clone(),
                updated_at: controller.updated_at,
                created_at: controller.created_at,
                expires_at: controller.expires_at,
                scope: ControllerScope::Admin,
            },
        );
    }

    new_controllers
}

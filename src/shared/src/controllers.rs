use crate::types::state::{Controller, ControllerId, Controllers, UserId};
use crate::utils::principal_equal;
use candid::Principal;
use ic_cdk::api::time;
use std::collections::HashMap;

pub fn add_controllers(new_controllers: &[UserId], controllers: &mut Controllers) {
    for c in new_controllers {
        let existing_controller = controllers.get(c);

        let now = time();

        let created_at: u64 = match existing_controller {
            None => now,
            Some(existing_controller) => existing_controller.created_at,
        };

        let controller_id: ControllerId = match existing_controller {
            None => c.clone(),
            Some(existing_controller) => existing_controller.controller_id,
        };

        let updated_at: u64 = now;

        let controller: Controller = Controller {
            controller_id,
            metadata: HashMap::new(),
            created_at,
            updated_at,
            expires_at: None
        };

        controllers.insert(controller_id.clone(), controller);
    }
}

pub fn remove_controllers(remove_controllers: &[UserId], controllers: &mut Controllers) {
    for c in remove_controllers {
        controllers.remove(c);
    }
}

pub fn is_controller(caller: Principal, controllers: &Controllers) -> bool {
    controllers
        .iter()
        .any(|(&controller, _)| principal_equal(controller, caller))
}

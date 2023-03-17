use crate::types::state::{Controller, ControllerId, Controllers, UserId};
use crate::utils::principal_equal;
use ic_cdk::api::time;
use std::collections::HashMap;

pub fn add_controllers(new_controllers: &[UserId], controllers: &mut Controllers) {
    for controller_id in new_controllers {
        let existing_controller = controllers.get(controller_id);

        let now = time();

        let created_at: u64 = match existing_controller {
            None => now,
            Some(existing_controller) => existing_controller.created_at,
        };

        let updated_at: u64 = now;

        let controller: Controller = Controller {
            metadata: HashMap::new(),
            created_at,
            updated_at,
            expires_at: None,
        };

        controllers.insert(*controller_id, controller);
    }
}

pub fn remove_controllers(remove_controllers: &[UserId], controllers: &mut Controllers) {
    for c in remove_controllers {
        controllers.remove(c);
    }
}

pub fn is_controller(caller: UserId, controllers: &Controllers) -> bool {
    controllers
        .iter()
        .any(|(&controller, _)| principal_equal(controller, caller))
}

pub fn into_controller_ids(controllers: &Controllers) -> Vec<ControllerId> {
    controllers
        .clone()
        .into_iter()
        .map(|(controller_id, _)| controller_id)
        .collect::<Vec<ControllerId>>()
}

use crate::env::{CONSOLE, OBSERVATORY};
use crate::types::interface::SetController;
use crate::types::state::{Controller, ControllerId, Controllers, UserId};
use crate::utils::principal_equal;
use candid::Principal;
use ic_cdk::api::time;
use std::collections::HashMap;

pub fn init_controllers(new_controllers: &[UserId]) -> Controllers {
    let mut controllers: Controllers = Controllers::new();

    let controller_data: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
    };

    set_controllers(new_controllers, &controller_data, &mut controllers);

    controllers
}

pub fn set_controllers(
    new_controllers: &[UserId],
    controller_data: &SetController,
    controllers: &mut Controllers,
) {
    for controller_id in new_controllers {
        let existing_controller = controllers.get(controller_id);

        let now = time();

        let created_at: u64 = match existing_controller {
            None => now,
            Some(existing_controller) => existing_controller.created_at,
        };

        let updated_at: u64 = now;

        let controller: Controller = Controller {
            metadata: controller_data.metadata.clone(),
            created_at,
            updated_at,
            expires_at: controller_data.expires_at,
        };

        controllers.insert(*controller_id, controller);
    }
}

pub fn delete_controllers(remove_controllers: &[UserId], controllers: &mut Controllers) {
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

pub fn assert_max_number_of_controllers(
    current_controllers: &Controllers,
    controllers_ids: &[ControllerId],
    max_controllers: usize,
) -> Result<(), String> {
    let current_controller_ids = into_controller_ids(current_controllers);

    let new_controller_ids = controllers_ids.iter().copied().filter(|id| {
        !current_controller_ids
            .iter()
            .any(|current_id| current_id == id)
    });

    if current_controller_ids.len() + new_controller_ids.count() > max_controllers {
        return Err(format!(
            "Maximum number of controllers ({}) is already reached.",
            max_controllers
        ));
    }

    Ok(())
}

pub fn caller_is_console(caller: UserId) -> bool {
    let console = Principal::from_text(CONSOLE).unwrap();

    principal_equal(caller, console)
}

pub fn caller_is_observatory(caller: UserId) -> bool {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    principal_equal(caller, observatory)
}

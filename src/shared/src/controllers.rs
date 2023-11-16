use crate::env::{CONSOLE, OBSERVATORY};
use crate::types::interface::SetController;
use crate::types::state::{Controller, ControllerId, ControllerScope, Controllers, UserId};
use crate::utils::{principal_anonymous, principal_equal, principal_not_anonymous};
use candid::Principal;
use ic_cdk::api::time;
use std::collections::HashMap;

pub fn init_controllers(new_controllers: &[UserId]) -> Controllers {
    let mut controllers: Controllers = Controllers::new();

    let controller_data: SetController = SetController {
        metadata: HashMap::new(),
        expires_at: None,
        scope: ControllerScope::Admin,
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
            scope: controller_data.scope.clone(),
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
    principal_not_anonymous(caller)
        && controllers
            .iter()
            .any(|(&controller_id, _)| principal_equal(controller_id, caller))
}

pub fn is_admin_controller(caller: UserId, controllers: &Controllers) -> bool {
    principal_not_anonymous(caller)
        && controllers
            .iter()
            .any(|(&controller_id, controller)| match controller.scope {
                ControllerScope::Write => false,
                ControllerScope::Admin => principal_equal(controller_id, caller),
            })
}

pub fn into_controller_ids(controllers: &Controllers) -> Vec<ControllerId> {
    controllers
        .clone()
        .into_keys()
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

pub fn assert_no_anonymous_controller(controllers_ids: &[ControllerId]) -> Result<(), String> {
    let has_anonymous = controllers_ids
        .iter()
        .any(|controller_id| principal_anonymous(*controller_id));

    match has_anonymous {
        true => Err("Anonymous controller not allowed.".to_string()),
        false => Ok(()),
    }
}

pub fn caller_is_console(caller: UserId) -> bool {
    let console = Principal::from_text(CONSOLE).unwrap();

    principal_equal(caller, console)
}

pub fn caller_is_observatory(caller: UserId) -> bool {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    principal_equal(caller, observatory)
}

pub fn filter_admin_controllers(controllers: &Controllers) -> Controllers {
    controllers
        .clone()
        .into_iter()
        .filter(|(_, controller)| match controller.scope {
            ControllerScope::Write => false,
            ControllerScope::Admin => true,
        })
        .collect()
}

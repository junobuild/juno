use crate::types::interface::Controllers;
use crate::types::state::UserId;
use crate::utils::principal_equal;
use candid::Principal;

pub fn add_controllers(new_controllers: &[UserId], controllers: &mut Controllers) {
    controllers.extend(new_controllers.iter().cloned());
}

pub fn remove_controllers(remove_controllers: &[UserId], controllers: &mut Controllers) {
    for c in remove_controllers {
        controllers.remove(c);
    }
}

pub fn is_controller(caller: Principal, controllers: &Controllers) -> bool {
    controllers
        .iter()
        .any(|&controller| principal_equal(controller, caller))
}

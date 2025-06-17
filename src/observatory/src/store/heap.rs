use crate::memory::manager::STATE;
use crate::types::state::{ApiKey, Env, HeapState};
use junobuild_shared::controllers::{
    delete_controllers as delete_controllers_impl, set_controllers as set_controllers_impl,
};
use junobuild_shared::types::interface::SetController;
use junobuild_shared::types::state::{ControllerId, Controllers};
// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn set_controllers(new_controllers: &[ControllerId], controller: &SetController) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[ControllerId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

pub fn get_controllers() -> Controllers {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

// ---------------------------------------------------------
// Env
// ---------------------------------------------------------

pub fn set_env(env: &Env) {
    STATE.with(|state| set_env_impl(env, &mut state.borrow_mut().heap))
}

fn set_env_impl(env: &Env, state: &mut HeapState) {
    state.env = Some(env.clone());
}

pub fn get_email_api_key() -> Result<ApiKey, String> {
    let env = STATE.with(|state| state.borrow().heap.env.clone());

    if let Some(env) = env {
        if let Some(email_api_key) = env.email_api_key {
            return Ok(email_api_key);
        }
    }

    Err("No API key is set to send email.".to_string())
}

use crate::state::memory::manager::STATE;
use junobuild_shared::segments::access_keys::{
    delete_access_keys as delete_controllers_impl, set_access_keys as set_controllers_impl,
};
use junobuild_shared::types::interface::SetAccessKey;
use junobuild_shared::types::state::{AccessKeyId, AccessKeys};

// ---------------------------------------------------------
// Controllers
// ---------------------------------------------------------

pub fn set_controllers(new_controllers: &[AccessKeyId], controller: &SetAccessKey) {
    STATE.with(|state| {
        set_controllers_impl(
            new_controllers,
            controller,
            &mut state.borrow_mut().heap.controllers,
        )
    })
}

pub fn delete_controllers(remove_controllers: &[AccessKeyId]) {
    STATE.with(|state| {
        delete_controllers_impl(remove_controllers, &mut state.borrow_mut().heap.controllers)
    })
}

pub fn get_controllers() -> AccessKeys {
    STATE.with(|state| state.borrow().heap.controllers.clone())
}

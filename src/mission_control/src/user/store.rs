use crate::memory::manager::STATE;
use crate::types::state::{Config, HeapState, MissionControlSettings, User};
use junobuild_shared::types::state::{Metadata, UserId};

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().heap.user.user).unwrap()
}

pub fn get_user_data() -> User {
    STATE.with(|state| state.borrow().heap.user.clone())
}

pub fn get_settings() -> Option<MissionControlSettings> {
    STATE.with(|state| state.borrow().heap.settings.clone())
}

pub fn get_metadata() -> Metadata {
    STATE.with(|state| state.borrow().heap.user.metadata.clone())
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().heap))
}

pub fn get_config() -> Option<Config> {
    STATE.with(|state| state.borrow().heap.user.config.clone())
}

pub fn set_config(config: &Option<Config>) {
    STATE.with(|state| set_config_impl(config, &mut state.borrow_mut().heap))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut HeapState) {
    let updated_user = state.user.clone_with_metadata(metadata);
    state.user = updated_user;
}

fn set_config_impl(config: &Option<Config>, state: &mut HeapState) {
    let updated_user = state.user.clone_with_config(config);
    state.user = updated_user;
}

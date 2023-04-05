use crate::types::state::{StableState, User};
use crate::STATE;
use ic_cdk::api::time;
use shared::types::state::{Metadata, UserId};

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().stable.user.user).unwrap()
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().stable))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut StableState) {
    let now = time();

    let updated_user = User {
        user: state.user.user,
        metadata: metadata.clone(),
        created_at: state.user.created_at,
        updated_at: now,
    };

    state.user = updated_user;
}

use crate::memory::STATE;
use crate::types::state::{
    ArchiveStatusesSegments, HeapState, MissionControlSettings, Statuses, User,
};
use candid::Principal;
use ic_cdk::api::time;
use junobuild_shared::types::state::{Metadata, UserId};

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().heap.user.user).unwrap()
}

pub fn get_settings() -> Option<MissionControlSettings> {
    STATE.with(|state| state.borrow().heap.settings.clone())
}

pub fn set_metadata(metadata: &Metadata) {
    STATE.with(|state| set_metadata_impl(metadata, &mut state.borrow_mut().heap))
}

fn set_metadata_impl(metadata: &Metadata, state: &mut HeapState) {
    let now = time();

    let updated_user = User {
        user: state.user.user,
        metadata: metadata.clone(),
        created_at: state.user.created_at,
        updated_at: now,
    };

    state.user = updated_user;
}

use crate::factory::store::{get_ufos, set_ufo_metadata as set_ufo_metadata_store};
use crate::factory::ufo::{attach_ufo, detach_ufo};
use crate::guards::caller_is_user_or_admin_controller;
use crate::types::state::{Ufo, Ufos};
use ic_cdk_macros::{query, update};
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::types::state::{Metadata, UfoId};

#[query(guard = "caller_is_user_or_admin_controller")]
fn list_ufos() -> Ufos {
    get_ufos()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_ufo(ufo_id: UfoId, name: Option<String>) -> Ufo {
    attach_ufo(&ufo_id, &name).unwrap_or_trap()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn unset_ufo(ufo_id: UfoId) {
    detach_ufo(&ufo_id).unwrap_or_trap()
}

#[update(guard = "caller_is_user_or_admin_controller")]
fn set_ufo_metadata(ufo_id: UfoId, metadata: Metadata) -> Ufo {
    set_ufo_metadata_store(&ufo_id, &metadata).unwrap_or_trap()
}

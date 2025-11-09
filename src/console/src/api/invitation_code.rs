use crate::guards::caller_is_admin_controller;
use crate::store::heap::add_invitation_code as add_invitation_code_store;
use crate::types::state::InvitationCode;
use ic_cdk_macros::update;

#[update(guard = "caller_is_admin_controller")]
fn add_invitation_code(code: InvitationCode) {
    add_invitation_code_store(&code);
}

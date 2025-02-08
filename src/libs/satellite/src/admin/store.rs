use junobuild_shared::types::state::UserId;
use crate::admin::state::{get_user_admin as get_user_admin_state, set_user_admin_banned};
use crate::admin::types::state::{BannedReason, UserAdmin};

pub fn get_user_admin(
    user_id: &UserId
) -> Option<UserAdmin> {
    get_user_admin_state(user_id)
}

pub fn set_user_banned(
    user_id: &UserId,
    banned: &Option<BannedReason>,
) -> UserAdmin {
    set_user_admin_banned(user_id, banned)
}
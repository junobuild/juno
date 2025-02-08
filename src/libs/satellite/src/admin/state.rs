use junobuild_shared::types::state::UserId;
use crate::admin::types::state::{BannedReason, UserAdmin, UserAdminKey, UserAdminStable};
use crate::memory::STATE;

pub fn get_user_admin(
    user_id: &UserId,
) -> Option<UserAdmin> {
    STATE.with(|state| {
        get_user_admin_impl(
            user_id,
            &state.borrow().stable.user_admin,
        )
    })
}

pub fn set_user_admin_banned(
    user_id: &UserId,
    banned: &Option<BannedReason>,
) -> UserAdmin {
    STATE.with(|state| {
        set_user_admin_banned_impl(
            user_id,
            banned,
            &mut state.borrow_mut().stable.user_admin,
        )
    })
}

fn get_user_admin_impl(
    user_id: &UserId,
    state: &UserAdminStable,
) -> Option<UserAdmin> {
    let key = UserAdminKey::create(user_id);

    state.get(&key)
}

fn set_user_admin_banned_impl(
    user_id: &UserId,
    banned: &Option<BannedReason>,
    state: &mut UserAdminStable,
) -> UserAdmin {
    let key = UserAdminKey::create(user_id);

    let current_user_admin = state.get(&key);

    let update_admin = UserAdmin::set_banned(&current_user_admin, banned);

    state.insert(key, update_admin.clone());

    update_admin
}

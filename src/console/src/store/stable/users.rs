use crate::store::services::read_stable_state;
use crate::types::state::{AliasId, MissionControl, StableState, User, UserRole, UsersStable};
use junobuild_shared::types::state::UserId;
use junobuild_shared::utils::principal_equal;

pub fn main_user_id_of(maybe_alias_id: &AliasId) -> Option<UserId> {
    read_stable_state(|stable| main_user_id_of_impl(maybe_alias_id, &stable.users))
}

fn main_user_id_of_impl(maybe_alias_id: &AliasId, users: &UsersStable) -> Option<UserId> {
    if let Some(user) = users.get(maybe_alias_id) {
        if let UserRole::Alias(alias) = &user.role {
            return Some(alias.main_id);
        }
    }

    None
}


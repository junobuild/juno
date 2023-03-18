use crate::STATE;
use shared::types::state::UserId;

pub fn get_user() -> UserId {
    STATE.with(|state| state.borrow().stable.user.user).unwrap()
}

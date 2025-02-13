use crate::user::admin::types::state::UserAdminKey;
use junobuild_shared::types::state::UserId;

impl UserAdminKey {
    pub fn create(user_id: &UserId) -> Self {
        Self { user_id: *user_id }
    }

    pub fn to_key(&self) -> String {
        self.user_id.to_text()
    }
}

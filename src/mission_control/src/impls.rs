use crate::types::state::User;
use ic_cdk::api::time;
use shared::types::interface::UserId;
use std::collections::HashMap;

impl From<&UserId> for User {
    fn from(user: &UserId) -> Self {
        let now = time();

        User {
            user: Some(*user),
            metadata: HashMap::new(),
            created_at: now,
            updated_at: now,
        }
    }
}

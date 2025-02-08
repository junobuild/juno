use crate::admin::types::state::{BannedReason, UserAdmin, UserAdminKey};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::{Timestamp, UserId, Version, Versioned};
use junobuild_shared::version::next_version;
use std::borrow::Cow;

impl Storable for UserAdmin {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for UserAdminKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl UserAdminKey {
    pub fn create(user_id: &UserId) -> Self {
        Self { user_id: *user_id }
    }
}

impl UserAdmin {
    pub fn set_banned(
        current_user_admin: &Option<UserAdmin>,
        banned: &Option<BannedReason>,
    ) -> Self {
        let now = time();

        let created_at: Timestamp = match current_user_admin {
            None => now,
            Some(current_user_usage) => current_user_usage.created_at,
        };

        let version = next_version(current_user_admin);

        let updated_at: Timestamp = now;

        UserAdmin {
            banned: banned.clone(),
            created_at,
            updated_at,
            version: Some(version),
        }
    }
}

impl Versioned for UserAdmin {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

pub mod state {
    use candid::CandidType;
    use ic_stable_structures::StableBTreeMap;
    use serde::{Deserialize, Serialize};
    use junobuild_shared::types::memory::Memory;
    use junobuild_shared::types::state::{Timestamp, UserId, Version};

    pub type UserAdminStable = StableBTreeMap<UserAdminKey, UserAdmin, Memory>;

    /// A unique key for a user.
    ///
    /// It consists of:
    /// - `user_id`: The unique identifier for the user which is matched to the caller.
    #[derive(CandidType, Serialize, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
    pub struct UserAdminKey {
        pub user_id: UserId,
    }

    /// Administrative data associated with a user.
    ///
    /// It consists of:
    /// - `banned`: The reason why the user is banned, if applicable. If None, user is not banned.
    /// - `created_at`: The timestamp when the record was created.
    /// - `updated_at`: The timestamp when the record was last updated.
    /// - `version`: The version of the record.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UserAdmin {
        pub banned: Option<BannedReason>,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }

    /// The reason why a user is banned.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum BannedReason {
        Indefinite,
    }
}

pub mod interface {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;
    use crate::admin::types::state::BannedReason;

    /// Represents the parameters for setting or updating a user's admin entry for a controller.
    ///
    /// It includes:
    /// - `banned`: The reason why the user is banned, if applicable. If None, user is not banned.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetUserAdmin {
        pub banned: Option<BannedReason>,
    }
}
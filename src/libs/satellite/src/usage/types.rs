pub mod state {
    use candid::CandidType;
    use junobuild_shared::types::core::Key;
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::{Deserialize, Serialize};

    pub type UserUsageKey = Key;

    /// Tracks the usage (create, set and delete) of a user in a collection.
    ///
    ///
    /// Fields:
    /// - `changes_count`: The total number of changes (create/update/delete) by the user.
    /// - `created_at`: The timestamp when this user usage entry was first recorded.
    /// - `updated_at`: The timestamp of the last update to this user usage entry.
    /// - `version`: An optional field representing the version of this usage entry. In the future we might implement checks to avoid overwrite but, this is not the case currently.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UserUsage {
        pub changes_count: u32,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
        pub version: Option<Version>,
    }
}

pub mod interface {
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    /// Represents the parameters for setting or updating a user's usage entry for a controller.
    ///
    /// This is useful if one want to set a value after the upgrade, given the lack of migration, or if a controller ever wants to reset the value to allow a user who would hit the limit to continue submitted changes.
    ///
    /// It includes:
    /// - `changes_count`: The total number of changes the user has in a specific collection.
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct SetUserUsage {
        pub changes_count: u32,
    }
}

pub mod state {
    use candid::CandidType;
    use serde::{Deserialize, Serialize};

    /// Administrative data associated with a user.
    ///
    /// It consists of:
    /// - `banned`: The reason why the user is banned, if applicable. If None, user is not banned.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct UserAdmin {
        pub banned: Option<BannedReason>,
    }

    /// The reason why a user is banned.
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub enum BannedReason {
        Indefinite,
    }
}

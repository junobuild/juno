pub mod state {
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserData {
        pub provider: Option<AuthProvider>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthProvider {
        InternetIdentity,
        Nfid,
    }

    /// Administrative data associated with a user.
    ///
    /// It consists of:
    /// - `banned`: The reason why the user is banned, if applicable. If None, user is not banned.
    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserAdminData {
        pub banned: Option<BannedReason>,
    }

    /// The reason why a user is banned.
    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }
}

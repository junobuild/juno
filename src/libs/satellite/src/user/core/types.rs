pub mod state {
    use junobuild_auth::types::config::AuthenticationProvider;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserData {
        pub provider: Option<AuthenticationProvider>,
        pub banned: Option<BannedReason>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }
}

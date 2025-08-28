pub mod state {
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserData {
        pub provider: Option<AuthProvider>,
        pub banned: Option<BannedReason>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthProvider {
        InternetIdentity,
        Nfid,
        #[serde(rename = "webauthn")]
        WebAuthn,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }
}

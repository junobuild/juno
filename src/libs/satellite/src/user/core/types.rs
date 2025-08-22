pub mod state {
    use serde::{Deserialize, Serialize};
    use junobuild_utils::DocDataUint8Array;

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields)]
    pub struct UserData {
        pub provider: Option<AuthProvider>,
        pub banned: Option<BannedReason>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct UserWebAuthnData {
        pub public_key: DocDataUint8Array,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthProvider {
        InternetIdentity,
        Nfid,
        WebAuthn,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }
}

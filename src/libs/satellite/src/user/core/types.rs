pub mod state {
    use junobuild_utils::DocDataUint8Array;
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct UserData {
        pub provider: Option<AuthProvider>,
        pub auth_metadata: Option<AuthMetadata>,
        pub banned: Option<BannedReason>,
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

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthMetadata {
        WebAuthn(WebAuthnMetadata),
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case", deny_unknown_fields)]
    pub struct WebAuthnMetadata {
        // Particularly useful ID to retrieve the public key in the collection #user-webauthn
        pub credential_id: DocDataUint8Array,
    }
}

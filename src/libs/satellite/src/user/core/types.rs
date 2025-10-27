pub mod state {
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    #[serde(deny_unknown_fields, rename_all = "camelCase")]
    pub struct UserData {
        pub provider: Option<AuthProvider>,
        pub banned: Option<BannedReason>,
        pub provider_data: Option<ProviderData>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum AuthProvider {
        InternetIdentity,
        Nfid,
        #[serde(rename = "webauthn")]
        WebAuthn,
        Google
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }

    pub trait Validated {
        fn validate(&self) -> Result<(), String>;
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum ProviderData {
        #[serde(rename = "webauthn")]
        WebAuthn(WebAuthnData),
        Google(GoogleData)
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct WebAuthnData {
        pub aaguid: Option<Vec<u8>>,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct GoogleData {
        pub email: Option<String>,
        pub name: Option<String>,
        pub picture: Option<String>,
    }
}

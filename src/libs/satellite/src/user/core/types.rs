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
        #[deprecated(note = "Support for NFID is deprecated in the tooling and documentation")]
        Nfid,
        #[serde(rename = "webauthn")]
        WebAuthn,
        Google,
    }

    #[derive(Serialize, Deserialize, Clone)]
    #[serde(rename_all = "snake_case")]
    pub enum BannedReason {
        Indefinite,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "snake_case")]
    pub enum ProviderData {
        #[serde(rename = "webauthn")]
        WebAuthn(WebAuthnData),
        #[serde(rename = "openid")]
        OpenId(OpenIdData),
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct WebAuthnData {
        pub aaguid: Option<Vec<u8>>,
    }

    // https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload
    // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
    #[derive(Serialize, Deserialize, Eq, PartialEq)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct OpenIdData {
        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
    }
}

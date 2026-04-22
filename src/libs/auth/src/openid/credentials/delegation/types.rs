pub mod interface {
    pub struct OpenIdDelegationCredentialKey<'a> {
        pub iss: &'a String,
        pub sub: &'a String,
    }

    #[derive(Debug)]
    pub struct OpenIdDelegationCredential {
        pub iss: String,
        pub sub: String,

        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub preferred_username: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
    }
}

pub(crate) mod token {
    use candid::Deserialize;
    use serde::Serialize;

    #[derive(Debug, Clone, Deserialize, Serialize)]
    pub struct DelegationClaims {
        pub iss: String,
        pub sub: String,
        pub aud: String,
        pub exp: Option<u64>,
        pub nbf: Option<u64>,
        pub iat: Option<u64>,

        pub nonce: Option<String>,

        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub preferred_username: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
    }
}

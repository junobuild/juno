pub mod interface {
    pub struct OpenIdAutomationCredential {
        pub iss: String,
        pub sub: String,

        // See https://docs.github.com/en/actions/concepts/security/openid-connect#understanding-the-oidc-token
        pub jti: Option<String>,
        pub repository: Option<String>,
        pub repository_owner: Option<String>,
        pub r#ref: Option<String>,
        pub run_id: Option<String>,
        pub run_number: Option<String>,
        pub run_attempt: Option<String>,
    }
}

pub(crate) mod token {
    use candid::Deserialize;
    use serde::Serialize;

    #[derive(Debug, Clone, Deserialize, Serialize)]
    pub struct AutomationClaims {
        pub iss: String,
        pub sub: String,
        pub aud: String,
        pub exp: Option<u64>,
        pub nbf: Option<u64>,
        pub iat: Option<u64>,

        pub nonce: Option<String>,

        pub jti: Option<String>,
        pub repository: Option<String>,
        pub repository_owner: Option<String>,
        pub r#ref: Option<String>,
        pub run_id: Option<String>,
        pub run_number: Option<String>,
        pub run_attempt: Option<String>,
    }
}

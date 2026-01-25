pub mod interface {
    pub struct OpenIdCredentialKey<'a> {
        pub iss: &'a String,
        pub sub: &'a String,
    }

    pub struct OpenIdCredential {
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

pub(crate) mod errors {
    use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
    use crate::openid::jwt::types::errors::{JwtFindProviderError, JwtVerifyError};
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum VerifyOpenidCredentialsError {
        GetOrFetchJwks(GetOrRefreshJwksError),
        GetCachedJwks,
        JwtFindProvider(JwtFindProviderError),
        JwtVerify(JwtVerifyError),
    }
}

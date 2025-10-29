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

pub mod provider {
    use crate::openid::jwt::types::cert::Jwks;
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::state::{Timestamp, Version};
    use serde::Serialize;

    #[derive(
        CandidType, Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Debug,
    )]
    pub enum OpenIdProvider {
        Google,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdCertificate {
        pub jwks: Jwks,

        pub created_at: Timestamp,
        pub updated_at: Timestamp,

        pub version: Option<Version>,
    }
}

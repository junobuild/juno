pub(crate) mod errors {
    use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
    use crate::openid::jwt::types::errors::{JwtFindProviderError, JwtVerifyError};
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum VerifyOpenidCredentialsError {
        InvalidObservatoryId(String),
        GetOrFetchJwks(GetOrRefreshJwksError),
        GetCachedJwks,
        JwtFindProvider(JwtFindProviderError),
        JwtVerify(JwtVerifyError),
    }
}

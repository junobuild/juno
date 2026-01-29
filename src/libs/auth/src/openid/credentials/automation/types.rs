pub mod errors {
    use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
    use crate::openid::jwt::types::errors::JwtVerifyError;
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum VerifyOpenidAutomationCredentialsError {
        GetOrFetchJwks(GetOrRefreshJwksError),
        GetCachedJwks,
        JwtVerify(JwtVerifyError),
    }
}

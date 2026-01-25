pub(crate) mod errors {
    use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
    use crate::openid::jwt::types::errors::JwtVerifyError;
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum VerifyOpenidWorkloadCredentialsError {
        GetOrFetchJwks(GetOrRefreshJwksError),
        GetCachedJwks,
        JwtVerify(JwtVerifyError),
    }
}

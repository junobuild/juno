pub(crate) mod errors {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Debug)]
    pub enum GetOrRefreshJwksError {
        BadSig(String),
        BadClaim(String),
        MissingKid,
        KeyNotFoundCooldown,
        KeyNotFound,
        FetchFailed(String),
        CertificateNotFound,
    }
}

pub mod interface {
    use crate::openid::types::provider::OpenIdProvider;
    use candid::{CandidType, Deserialize};

    #[derive(CandidType, Deserialize, Clone)]
    pub struct GetOpenIdCertificateArgs {
        pub provider: OpenIdProvider,
    }
}

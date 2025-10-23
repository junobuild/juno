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
    }
}

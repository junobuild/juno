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
        GitHubProxy,
        GitHubActions,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct OpenIdCertificate {
        pub jwks: Jwks,

        pub created_at: Timestamp,
        pub updated_at: Timestamp,

        pub version: Option<Version>,
    }
}

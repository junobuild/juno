pub mod provider {
    use candid::{CandidType, Deserialize};
    use serde::Serialize;

    #[derive(
        CandidType, Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Debug,
    )]
    pub enum OpenIdDelegationProvider {
        Google,
        GitHub,
    }
}

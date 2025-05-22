pub mod logs {
    use candid::{CandidType, Deserialize};
    use junobuild_shared::types::core::Blob;
    use serde::Serialize;

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub enum LogLevel {
        Debug,
        Info,
        Warning,
        Error,
    }

    #[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
    pub struct Log {
        pub level: LogLevel,
        pub message: String,
        pub data: Option<Blob>,
    }
}

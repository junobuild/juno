pub mod logs {
    use crate::Blob;
    use candid::{CandidType, Deserialize};
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

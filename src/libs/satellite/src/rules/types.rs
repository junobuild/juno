pub mod state {
    use serde::{Deserialize, Serialize};

    #[derive(Serialize, Deserialize)]
    pub struct UserData {
        // We use a string instead of a strict typed enum because this value was originally introduced
        // and has been used exclusively as presentation information.
        pub provider: Option<String>,
    }
}

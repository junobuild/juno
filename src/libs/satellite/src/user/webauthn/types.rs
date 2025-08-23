pub mod state {
    use junobuild_utils::DocDataUint8Array;
    use serde::{Deserialize, Serialize};

    // Key is the passkey credential ID (raw ID)

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct UserWebAuthnData {
        pub public_key: DocDataUint8Array,
    }
}

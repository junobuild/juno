pub mod state {
    use junobuild_utils::DocDataUint8Array;
    use serde::{Deserialize, Serialize};

    // The key for the collection is the textual representation of passkey credential ID (raw ID).
    pub type UserWebAuthnCredentialId = String;

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct UserWebAuthnData {
        pub public_key: DocDataUint8Array,
    }

    #[derive(Serialize, Deserialize)]
    #[serde(rename_all = "camelCase", deny_unknown_fields)]
    pub struct UserWebAuthnIndex {
        // The credential_id is available in the field description. This allow
        // to read the index without deserializing the data.
    }
}

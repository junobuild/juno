pub const JUNO_DATASTORE_ERROR_USER_CANNOT_UPDATE: &str = "juno.datastore.error.user.cannot_update";
pub const JUNO_DATASTORE_ERROR_USER_INVALID_DATA: &str = "juno.datastore.error.user.invalid_data";
// Caller and key must match to create a user.
pub const JUNO_DATASTORE_ERROR_USER_CALLER_KEY: &str = "juno.datastore.error.user.caller_key";
// User key must be a textual representation of a principal.
pub const JUNO_DATASTORE_ERROR_USER_KEY_NO_PRINCIPAL: &str =
    "juno.datastore.error.user.key_no_principal";
// Banned
pub const JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED: &str = "juno.datastore.error.user.not_allowed";
// For Internet Identity and NFID, no auth metadata
pub const JUNO_DATASTORE_ERROR_USER_INVALID_AUTH_METADATA: &str =
    "juno.datastore.error.user.invalid_auth_metadata";
// For WebAuthn, auth metadata is required
pub const JUNO_DATASTORE_ERROR_USER_MISSING_AUTH_METADATA: &str =
    "juno.datastore.error.user.missing_auth_metadata";

// Change limit reached.
pub const JUNO_DATASTORE_ERROR_USER_USAGE_CHANGE_LIMIT_REACHED: &str =
    "juno.datastore.error.user.usage.change_limit_reached";
pub const JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA: &str =
    "juno.datastore.error.user.usage.invalid_data";

// The webauthn data can only be created not updated because those information are set during the sign-up process.
pub const JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CANNOT_UPDATE: &str =
    "juno.datastore.error.user.webauthn.cannot_update";
pub const JUNO_DATASTORE_ERROR_USER_WEBAUTHN_INVALID_DATA: &str =
    "juno.datastore.error.user.webauthn.invalid_data";
// Caller and public key must match. Only the user can create their webauthn entry.
pub const JUNO_DATASTORE_ERROR_USER_WEBAUTHN_CALLER_KEY: &str =
    "juno.datastore.error.user.webauthn.caller_key";

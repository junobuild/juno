pub const JUNO_DATASTORE_ERROR_USER_CANNOT_UPDATE: &str = "juno.datastore.error.user.cannot_update";
pub const JUNO_DATASTORE_ERROR_USER_INVALID_DATA: &str = "juno.datastore.error.user.invalid_data";
// Caller and key must match to create a user.
pub const JUNO_DATASTORE_ERROR_USER_CALLER_KEY: &str = "juno.datastore.error.user.caller_key";
// User key must be a textual representation of a principal.
pub const JUNO_DATASTORE_ERROR_USER_KEY_NO_PRINCIPAL: &str =
    "juno.datastore.error.user.key_no_principal";
// Banned
pub const JUNO_DATASTORE_ERROR_USER_NOT_ALLOWED: &str = "juno.datastore.error.user.not_allowed";
// The AAGUID (Authenticator Attestation GUID) must be exactly 16 bytes.
pub const JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH: &str =
    "juno.datastore.error.user.webauthn.aaguid_invalid_length";
pub const JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA: &str =
    "juno.datastore.error.user.webauthn.provider_invalid_data";
pub const JUNO_DATASTORE_ERROR_USER_PROVIDER_WEBAUTHN_INVALID_DATA: &str =
    "juno.datastore.error.user.webauthn.provider_webauthn_invalid_data";

pub const JUNO_DATASTORE_ERROR_USER_PROVIDER_GOOGLE_INVALID_DATA: &str =
    "juno.datastore.error.user.google.provider_google_invalid_data";
// An email must not be longer than 254 characters
pub const JUNO_DATASTORE_ERROR_USER_EMAIL_INVALID_LENGTH: &str =
    "juno.datastore.error.user.data.email_invalid_length";
// A name must not be longer than 255 characters
pub const JUNO_DATASTORE_ERROR_USER_NAME_INVALID_LENGTH: &str =
    "juno.datastore.error.user.data.name_invalid_length";
// A given name must not be longer than 100 characters
pub const JUNO_DATASTORE_ERROR_USER_GIVEN_NAME_INVALID_LENGTH: &str =
    "juno.datastore.error.user.data.given_name_invalid_length";
// A family name must not be longer than 100 characters
pub const JUNO_DATASTORE_ERROR_USER_FAMILY_NAME_INVALID_LENGTH: &str =
    "juno.datastore.error.user.data.family_name_invalid_length";
// Locale must not be longer than 35 characters
pub const JUNO_DATASTORE_ERROR_USER_LOCALE_INVALID_LENGTH: &str =
    "juno.datastore.error.user.data.locale_invalid_length";
pub const JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_URL: &str =
    "juno.datastore.error.user.data.picture_invalid_url";
pub const JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_SCHEME: &str =
    "juno.datastore.error.user.data.picture_invalid_scheme";

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

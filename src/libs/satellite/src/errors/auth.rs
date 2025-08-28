// Error message indicating that a domain - derivation or external alternative origins - cannot be parsed to a valid URL.
pub const JUNO_AUTH_ERROR_INVALID_ORIGIN: &str = "juno.auth.error.invalid_origin";
// Caller is not an admin controller of the satellite.
pub const JUNO_AUTH_ERROR_NOT_ADMIN_CONTROLLER: &str = "juno.auth.error.not_admin_controller";
// Caller is not an admin or write controller of the satellite.
pub const JUNO_AUTH_ERROR_NOT_WRITE_CONTROLLER: &str = "juno.auth.error.not_write_controller";
// Caller is not a controller of the satellite.
pub const JUNO_AUTH_ERROR_NOT_CONTROLLER: &str = "juno.auth.error.not_controller";
// Caller is not allowed to use any services of the satellite.
pub const JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED: &str = "juno.auth.error.caller.not_allowed";
// By default - or if developer wish to disable it - sign-in with webauthn is not enabled.
pub const JUNO_AUTH_ERROR_PROVIDER_WEBAUTHN_NOT_ENABLED: &str =
    "juno.auth.error.provider.webauthn_not_enabled";
// By default sign-in with Internet Identity is enabled.
pub const JUNO_AUTH_ERROR_PROVIDER_INTERNET_IDENTITY_NOT_ENABLED: &str =
    "juno.auth.error.provider.internet_identity_not_enabled";
// By default sign-in with NFID is enabled.
pub const JUNO_AUTH_ERROR_PROVIDER_NFID_NOT_ENABLED: &str =
    "juno.auth.error.provider.nfid_not_enabled";

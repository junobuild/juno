use crate::errors::auth::{
    JUNO_AUTH_ERROR_PROVIDER_INTERNET_IDENTITY_NOT_ENABLED,
    JUNO_AUTH_ERROR_PROVIDER_NFID_NOT_ENABLED, JUNO_AUTH_ERROR_PROVIDER_PASSKEY_NOT_ENABLED,
};
use junobuild_auth::types::config::{AuthenticationConfig, AuthenticationProvider};

pub fn assert_passkey_enabled(config: &Option<AuthenticationConfig>) -> Result<(), String> {
    assert_built_in_provider_enabled(
        config,
        &AuthenticationProvider::Passkey,
        JUNO_AUTH_ERROR_PROVIDER_PASSKEY_NOT_ENABLED,
    )
}

pub fn assert_internet_identity_enabled(
    config: &Option<AuthenticationConfig>,
) -> Result<(), String> {
    assert_third_party_provider_enabled(
        config,
        &AuthenticationProvider::InternetIdentity,
        JUNO_AUTH_ERROR_PROVIDER_INTERNET_IDENTITY_NOT_ENABLED,
    )
}

pub fn assert_nfid_enabled(config: &Option<AuthenticationConfig>) -> Result<(), String> {
    assert_third_party_provider_enabled(
        config,
        &AuthenticationProvider::Nfid,
        JUNO_AUTH_ERROR_PROVIDER_NFID_NOT_ENABLED,
    )
}

fn assert_built_in_provider_enabled(
    config: &Option<AuthenticationConfig>,
    provider: &AuthenticationProvider,
    err_msg: &str,
) -> Result<(), String> {
    if let Some(auth_config) = config {
        if let Some(enabled_providers) = &auth_config.enabled_providers {
            if enabled_providers.contains(provider) {
                return Ok(());
            }
        }
    }

    Err(err_msg.to_string())
}

fn assert_third_party_provider_enabled(
    config: &Option<AuthenticationConfig>,
    provider: &AuthenticationProvider,
    err_msg: &str,
) -> Result<(), String> {
    let Some(auth_config) = config else {
        return Ok(());
    };

    let Some(enabled_providers) = &auth_config.enabled_providers else {
        return Ok(());
    };

    if enabled_providers.contains(provider) {
        return Ok(());
    }

    Err(err_msg.to_string())
}

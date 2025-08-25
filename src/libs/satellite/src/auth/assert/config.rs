use crate::errors::auth::JUNO_AUTH_ERROR_INVALID_ORIGIN;
use junobuild_auth::types::config::AuthenticationConfig;
use junobuild_auth::types::interface::SetAuthenticationConfig;
use junobuild_shared::assert::assert_version;
use junobuild_shared::types::core::DomainName;
use junobuild_shared::types::state::Version;
use url::Url;

pub fn assert_set_config(
    proposed_config: &SetAuthenticationConfig,
    current_config: &Option<AuthenticationConfig>,
) -> Result<(), String> {
    assert_config_origin_urls(proposed_config)?;

    assert_config_version(current_config, proposed_config.version)?;

    Ok(())
}

fn assert_config_origin_urls(config: &SetAuthenticationConfig) -> Result<(), String> {
    if let Some(internet_identity) = &config.internet_identity {
        if let Some(derivation_origin) = &internet_identity.derivation_origin {
            assert_url(derivation_origin)?;
        }

        if let Some(external_alternative_origins) = &internet_identity.external_alternative_origins
        {
            for origin in external_alternative_origins {
                assert_url(origin)?;
            }
        }
    }

    Ok(())
}

fn assert_url(domain: &DomainName) -> Result<(), String> {
    let parsed_url = Url::parse(&format!("https://{domain}"));

    match parsed_url {
        Err(_) => Err(format!("{JUNO_AUTH_ERROR_INVALID_ORIGIN} ({domain})")),
        Ok(_url) => Ok(()),
    }
}

fn assert_config_version(
    current_config: &Option<AuthenticationConfig>,
    proposed_version: Option<Version>,
) -> Result<(), String> {
    if let Some(cfg) = current_config {
        assert_version(proposed_version, cfg.version)?
    }

    Ok(())
}

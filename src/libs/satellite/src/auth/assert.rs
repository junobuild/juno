use crate::auth::msg::ERROR_INVALID_ORIGIN;
use crate::auth::types::config::AuthenticationConfig;
use junobuild_shared::types::core::DomainName;
use url::Url;

pub fn assert_config_origin_urls(config: &AuthenticationConfig) -> Result<(), String> {
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
    let parsed_url = Url::parse(&format!("https://{}", domain));

    match parsed_url {
        Err(_) => Err(format!("{} ({})", ERROR_INVALID_ORIGIN, domain)),
        Ok(_url) => Ok(()),
    }
}

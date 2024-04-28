use crate::auth::types::state::AuthenticationConfig;
use crate::storage::store::get_custom_domains_store;
use crate::storage::well_known::update::{
    delete_alternative_origins_asset, update_alternative_origins_asset,
};
use crate::types::core::DomainName;
use ic_cdk::id;
use serde::{Deserialize, Serialize};
use serde_json::to_string;
use url::Url;

#[derive(Serialize, Deserialize)]
struct AlternativeOrigins {
    #[serde(rename = "alternativeOrigins")]
    alternative_origins: Vec<String>,
}

pub fn update_alternative_origins(config: &AuthenticationConfig) -> Result<(), String> {
    config
        .internet_identity
        .as_ref()
        .and_then(|config| config.derivation_origin.as_ref())
        .map_or_else(delete_alternative_origins_asset, set_alternative_origins)
}

fn set_alternative_origins(derivation_origin: &DomainName) -> Result<(), String> {
    let mut custom_domains: Vec<DomainName> = get_custom_domains_store()
        .keys()
        .filter(|domain| *domain != derivation_origin)
        .cloned()
        .collect();

    // Add default system URL to alternative origins if not equals to derivation origin
    let canister_url = format!("{}.icp0.io", id().to_text());
    if canister_url != *derivation_origin {
        custom_domains.push(canister_url);
    }

    if custom_domains.is_empty() {
        return delete_alternative_origins_asset();
    }

    set_alternative_origins_with_custom_domains(&mut custom_domains)
}

fn set_alternative_origins_with_custom_domains(
    custom_domains: &mut Vec<DomainName>,
) -> Result<(), String> {
    // Assert URLs are valid
    fn parse_url(domain: &DomainName) -> Result<String, String> {
        let parsed_url = Url::parse(&format!("https://{}", domain));

        match parsed_url {
            Err(_) => Err(format!(
                "Invalid domain {} to configure an alternative origin.",
                domain
            )),
            Ok(url) => {
                let mut url_str = url.to_string();

                // Url crate parse with a trailing slash.
                // Not sure the specification requires not trailing slash but, given that those are displayed in the UI of Internet Identity, it's more elegant without it anyway.
                if url_str.ends_with('/') {
                    url_str.pop();
                }

                Ok(url_str)
            }
        }
    }

    let mut urls: Vec<String> = Vec::new();
    for domain in custom_domains {
        let url = parse_url(domain)?;

        urls.push(url);
    }

    let json = to_string(&AlternativeOrigins {
        alternative_origins: urls,
    })
    .map_err(|_| {
        "Cannot convert custom domains to II alternative origins JSON data.".to_string()
    })?;

    update_alternative_origins_asset(&json)
}

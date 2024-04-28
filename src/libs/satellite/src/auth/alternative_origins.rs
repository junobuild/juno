use crate::auth::types::state::AuthenticationConfig;
use crate::storage::well_known::update::{
    delete_alternative_origins_asset, update_alternative_origins_asset,
};
use serde::{Deserialize, Serialize};
use serde_json::to_string;

#[derive(Serialize, Deserialize)]
struct AlternativeOrigins {
    #[serde(rename = "alternativeOrigins")]
    alternative_origins: Vec<String>,
}

pub fn update_alternative_origins(config: &AuthenticationConfig) -> Result<(), String> {
    config
        .internet_identity
        .as_ref()
        .and_then(|config| config.authentication_domain.as_ref())
        .map_or_else(delete_alternative_origins_asset, |domain| {
            let json = to_string(&AlternativeOrigins {
                alternative_origins: vec![domain.clone()],
            })
            .map_err(|_| {
                "Cannot convert domain to II alternative origins JSON data.".to_string()
            })?;

            update_alternative_origins_asset(&json)
        })
}

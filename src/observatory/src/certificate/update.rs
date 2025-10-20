use crate::certificate::http::request::get_certificate;
use crate::memory::state::services::with_certificates_mut;
use crate::types::state::{Certificates, OpenIdCertificate, OpenIdProvider};
use junobuild_auth::openid::jwt::types::cert::Jwks;
use serde_json::from_slice;
use std::collections::HashMap;

pub async fn fetch_and_save_certificate(provider: &OpenIdProvider) -> Result<(), String> {
    let raw_json_value = get_certificate(provider).await?;

    let jwks = from_slice::<Jwks>(&raw_json_value).map_err(|e| e.to_string())?;

    with_certificates_mut(|state_certificates| {
        let certificates = state_certificates.get_or_insert_with(|| Certificates {
            openid: HashMap::new(),
        });

        certificates
            .openid
            .entry(provider.clone())
            .and_modify(|c| *c = OpenIdCertificate::update(c, &jwks))
            .or_insert_with(|| OpenIdCertificate::init(&jwks));
    });

    Ok(())
}

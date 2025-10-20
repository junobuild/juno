use crate::certificates::http::request::get_certificate;
use crate::types::state::OpenIdProvider;
use serde_json::{from_slice};
use junobuild_auth::openid::jwt::types::cert::Jwks;

pub async fn fetch_and_save_certificate(provider: &OpenIdProvider) -> Result<(), String> {
    let raw_json_value = get_certificate(provider).await?;

    let _jwks = from_slice::<Jwks>(&raw_json_value).map_err(|e| e.to_string())?;



    Ok(())
}
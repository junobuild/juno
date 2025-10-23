use crate::openid::jwtset::types::interface::GetOpenIdCertificate;
use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
use candid::Principal;
use ic_cdk::call::Call;
use junobuild_shared::env::OBSERVATORY;

pub async fn fetch_openid_certificate(
    provider: &OpenIdProvider,
) -> Result<Option<OpenIdCertificate>, String> {
    // TODO: optional parameter observatory ID
    let observatory = Principal::from_text(OBSERVATORY).map_err(|e| e.to_string())?;

    let certificate = Call::bounded_wait(observatory, "get_openid_certificate")
        .with_arg(GetOpenIdCertificate::from(provider))
        .await
        .map_err(|e| format!("Fetching OpenID certificate failed: {:?}", e))?
        .candid()
        .map_err(|e| format!("Decoding OpenID certificate failed: {:?}", e))?;

    Ok(certificate)
}

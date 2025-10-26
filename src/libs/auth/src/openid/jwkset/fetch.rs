use crate::openid::jwkset::types::interface::GetOpenIdCertificateArgs;
use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
use candid::Principal;
use ic_cdk::call::Call;

pub async fn fetch_openid_certificate(
    provider: &OpenIdProvider,
    observatory: Principal,
) -> Result<Option<OpenIdCertificate>, String> {
    let certificate = Call::bounded_wait(observatory, "get_openid_certificate")
        .with_arg(GetOpenIdCertificateArgs::from(provider))
        .await
        .map_err(|e| format!("Fetching OpenID certificate failed: {:?}", e))?
        .candid()
        .map_err(|e| format!("Decoding OpenID certificate failed: {:?}", e))?;

    Ok(certificate)
}

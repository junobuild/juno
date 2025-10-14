use crate::types::config::{OpenIdProvider, OpenIdProviderConfig, OpenIdProviders};
use jsonwebtoken::{decode_header, Algorithm, dangerous};
use serde::Deserialize;

#[derive(Debug)]
pub enum FindProviderErr {
    BadSig(String),
    BadClaim(&'static str),
    NoMatchingProvider,
}

impl core::fmt::Display for FindProviderErr {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            FindProviderErr::BadSig(msg) => write!(f, "bad signature: {msg}"),
            FindProviderErr::BadClaim(claim) => write!(f, "bad claim: {claim}"),
            FindProviderErr::NoMatchingProvider => {
                write!(f, "no matching OpenID provider for JWT (iss/aud mismatch)")
            }
        }
    }
}

#[derive(Clone, Deserialize)]
struct UnsafeClaims {
    pub iss: Option<String>,
}

pub fn unsafe_find_provider<'a>(
    providers: &'a OpenIdProviders,
    jwt: &str,
) -> Result<(OpenIdProvider, &'a OpenIdProviderConfig), FindProviderErr> {
    // 1) read header to get `kid`
    let header = decode_header(jwt).map_err(|e| FindProviderErr::BadSig(e.to_string()))?;

    if header.alg != Algorithm::RS256 {
        return Err(FindProviderErr::BadClaim("alg"));
    }

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt).map_err(|e| FindProviderErr::BadSig(e.to_string()))?;;

    // 3) Try to find by issuer
    if let Some(iss) = token_data.claims.iss.as_deref() {
        if let Some((prov, cfg)) = providers
            .iter()
            .find(|(provider, _)| provider.issuers().iter().any(|&known_iss| known_iss == iss))
        {
            return Ok((prov.clone(), cfg));
        }
    }

    Err(FindProviderErr::NoMatchingProvider)
}

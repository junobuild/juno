use crate::openid::jwt::header::decode_jwt_header;
use crate::openid::jwt::types::errors::JwtFindProviderError;
use crate::openid::jwt::types::token::UnsafeClaims;
use crate::openid::types::provider::OpenIdProvider;
use crate::state::types::config::{OpenIdProviderConfig, OpenIdProviders};
use jsonwebtoken::dangerous;

/// ⚠️ **Warning:** This function decodes the JWT payload *without verifying its signature*.
/// Use only to inspect claims (e.g., `iss`) before performing a verified decode.
pub fn unsafe_find_jwt_provider<'a>(
    providers: &'a OpenIdProviders,
    jwt: &str,
) -> Result<(OpenIdProvider, &'a OpenIdProviderConfig), JwtFindProviderError> {
    // 1) Header sanity check
    decode_jwt_header(jwt).map_err(JwtFindProviderError::from)?;

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt)
        .map_err(|e| JwtFindProviderError::BadSig(e.to_string()))?;

    // 3) Try to find by issuer
    if let Some(iss) = token_data.claims.iss.as_deref() {
        if let Some((prov, cfg)) = providers
            .iter()
            .find(|(provider, _)| provider.issuers().contains(&iss))
        {
            return Ok((prov.clone(), cfg));
        }
    }

    Err(JwtFindProviderError::NoMatchingProvider)
}

#[cfg(test)]
mod tests {
    use super::unsafe_find_jwt_provider;
    use crate::openid::jwt::types::errors::JwtFindProviderError;
    use crate::openid::types::provider::OpenIdProvider;
    use crate::state::types::config::{OpenIdProviderConfig, OpenIdProviders};
    use base64::engine::general_purpose::URL_SAFE_NO_PAD;
    use base64::Engine;
    use serde_json::json;
    use std::collections::BTreeMap;

    /// Build a syntactically valid JWT string with controlled header & payload.
    /// Signature can be junk; `unsafe_find_jwt_provider` uses `dangerous::insecure_decode`.
    fn jwt_with(header_val: serde_json::Value, payload_val: serde_json::Value) -> String {
        let h = URL_SAFE_NO_PAD.encode(serde_json::to_string(&header_val).unwrap());
        let p = URL_SAFE_NO_PAD.encode(serde_json::to_string(&payload_val).unwrap());
        let s = URL_SAFE_NO_PAD.encode("sig");
        format!("{h}.{p}.{s}")
    }

    fn providers_with_google() -> OpenIdProviders {
        let mut map = BTreeMap::new();
        map.insert(
            OpenIdProvider::Google,
            OpenIdProviderConfig {
                client_id: "client-123".into(),
            },
        );
        map
    }

    #[test]
    fn finds_provider_by_issuer_with_rs256_and_typ_jwt() {
        let iss = "https://accounts.google.com";

        let jwt = jwt_with(json!({"alg":"RS256","typ":"JWT"}), json!({"iss": iss}));

        let provs = providers_with_google();
        let (provider, cfg) =
            unsafe_find_jwt_provider(&provs, &jwt).expect("should match provider");

        assert_eq!(provider, OpenIdProvider::Google);
        assert_eq!(cfg.client_id, "client-123");
    }

    #[test]
    fn accepts_missing_typ_when_rs256() {
        let iss = "https://accounts.google.com";
        let jwt = jwt_with(json!({"alg":"RS256"}), json!({"iss": iss}));

        let provs = providers_with_google();
        let (provider, _) =
            unsafe_find_jwt_provider(&provs, &jwt).expect("should match even without typ");
        assert_eq!(provider, OpenIdProvider::Google);
    }

    #[test]
    fn rejects_wrong_alg() {
        let iss = "https://accounts.google.com";
        let jwt = jwt_with(json!({"alg":"HS256","typ":"JWT"}), json!({"iss": iss}));

        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();

        match err {
            JwtFindProviderError::BadClaim(f) => assert_eq!(f, "alg"),
            other => panic!("expected BadClaim(\"alg\"), got {other:?}"),
        }
    }

    #[test]
    fn rejects_wrong_typ() {
        let iss = "https://accounts.google.com";
        let jwt = jwt_with(
            json!({"alg":"RS256","typ":"JOT"}), // wrong typ
            json!({"iss": iss}),
        );

        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();

        match err {
            JwtFindProviderError::BadClaim(f) => assert_eq!(f, "typ"),
            other => panic!("expected BadClaim(\"typ\"), got {other:?}"),
        }
    }

    #[test]
    fn returns_no_matching_provider_when_issuer_missing() {
        let jwt = jwt_with(json!({"alg":"RS256","typ":"JWT"}), json!({}));
        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();
        assert!(matches!(err, JwtFindProviderError::NoMatchingProvider));
    }

    #[test]
    fn returns_no_matching_provider_when_issuer_unknown() {
        let jwt = jwt_with(
            json!({"alg":"RS256","typ":"JWT"}),
            json!({"iss":"https://unknown.example.com"}),
        );
        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();
        assert!(matches!(err, JwtFindProviderError::NoMatchingProvider));
    }

    #[test]
    fn malformed_token_is_badsig() {
        let jwt = "definitely-not-a-jwt";
        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, jwt).unwrap_err();
        assert!(matches!(err, JwtFindProviderError::BadSig(_)));
    }

    #[test]
    fn bad_payload_base64_is_badsig() {
        // valid header, broken payload (not base64url)
        let h = URL_SAFE_NO_PAD.encode(r#"{"alg":"RS256","typ":"JWT"}"#);
        let p = "!!!not-base64!!!";
        let s = URL_SAFE_NO_PAD.encode("sig");
        let jwt = format!("{h}.{p}.{s}");

        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();
        assert!(matches!(err, JwtFindProviderError::BadSig(_)));
    }

    #[test]
    fn empty_iss_is_no_match() {
        let jwt = jwt_with(json!({"alg":"RS256","typ":"JWT"}), json!({"iss": ""}));
        let provs = providers_with_google();
        let err = unsafe_find_jwt_provider(&provs, &jwt).unwrap_err();
        assert!(matches!(err, JwtFindProviderError::NoMatchingProvider));
    }
}

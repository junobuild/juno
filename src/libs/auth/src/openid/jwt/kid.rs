use crate::openid::jwt::decode_jwt_header;
use crate::openid::jwt::types::errors::JwtFindKidError;
use crate::openid::jwt::types::token::UnsafeClaims;
use jsonwebtoken::dangerous;

// TODO: refactor decode_jwt_header for perf reason

/// ⚠️ **Warning:** This function decodes the JWT *without verifying its signature*.
/// Use only to inspect the header (e.g., `kid`) before performing a verified decode
/// before finalizing any task.
pub fn unsafe_find_jwt_kid(jwt: &str) -> Result<String, JwtFindKidError> {
    // 1) Header sanity check
    decode_jwt_header(jwt).map_err(JwtFindKidError::from)?;

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt)
        .map_err(|e| JwtFindKidError::BadSig(e.to_string()))?;

    // 3) Return kid
    token_data.header.kid.ok_or(JwtFindKidError::MissingKid)
}

#[cfg(test)]
mod unsafe_find_kid_tests {
    use super::unsafe_find_jwt_kid;
    use crate::openid::jwt::types::{errors::JwtFindKidError, token::Claims};
    use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
    use std::time::{SystemTime, UNIX_EPOCH};

    const TEST_RSA_PEM: &str = include_str!("../../../tests/keys/test_rsa.pem");

    const ISS: &str = "https://accounts.google.com";
    const AUD: &str = "client-123";
    const KID_OK: &str = "test-kid-1";

    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn header_with(kid: Option<&str>) -> Header {
        let mut h = Header::new(Algorithm::RS256);
        h.typ = Some("JWT".into());
        h.kid = kid.map(str::to_string);
        h
    }

    fn claims_basic() -> Claims {
        let now = now_secs();
        Claims {
            iss: ISS.into(),
            sub: "sub".into(),
            aud: AUD.into(),
            exp: Some(now + 600),
            nbf: None,
            iat: Some(now),
            email: None,
            name: None,
            picture: None,
            nonce: None,
        }
    }

    fn sign_token(h: &Header, c: &Claims) -> String {
        let enc = EncodingKey::from_rsa_pem(TEST_RSA_PEM.as_bytes()).expect("valid pem");
        encode(h, c, &enc).expect("jwt encode")
    }

    fn tamper_signature(jwt: &str) -> String {
        // Flip the last character of the signature segment in a base64url-safe way.
        let mut parts: Vec<&str> = jwt.split('.').collect();
        assert_eq!(parts.len(), 3, "expected 3-part JWT");
        let mut sig = parts[2].to_string();
        if let Some(last) = sig.pop() {
            sig.push(if last == 'A' { 'B' } else { 'A' });
        }
        parts[2] = Box::leak(sig.into_boxed_str());
        parts.join(".")
    }

    #[test]
    fn finds_kid_ok() {
        let token = sign_token(&header_with(Some(KID_OK)), &claims_basic());
        let kid = unsafe_find_jwt_kid(&token).expect("should find kid");
        assert_eq!(kid, KID_OK);
    }

    #[test]
    fn missing_kid_yields_error() {
        let token = sign_token(&header_with(None), &claims_basic());
        let err = unsafe_find_jwt_kid(&token).unwrap_err();
        assert!(matches!(err, JwtFindKidError::MissingKid));
    }

    #[test]
    fn malformed_token_is_badsig() {
        // Not a JWT at all → base64/structure error → mapped to BadSig
        let err = unsafe_find_jwt_kid("not-a.jwt.token").unwrap_err();
        assert!(matches!(err, JwtFindKidError::BadSig(_)));
    }

    #[test]
    fn signature_is_ignored() {
        let token = sign_token(&header_with(Some(KID_OK)), &claims_basic());
        let tampered = tamper_signature(&token);
        // Still succeeds because we use `dangerous::insecure_decode` internally.
        let kid = unsafe_find_jwt_kid(&tampered).expect("kid should still be readable");
        assert_eq!(kid, KID_OK);
    }
}

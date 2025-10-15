use crate::delegation::openid::jwt::header::decode_jwt_header;
use crate::delegation::openid::jwt::types::{Claims, Jwk, JwtVerifyError};
use jsonwebtoken::{decode, Algorithm, DecodingKey, TokenData, Validation};

fn pick_key<'a>(kid: &str, jwks: &'a [Jwk]) -> Option<&'a Jwk> {
    jwks.iter().find(|j| j.kid.as_deref() == Some(kid))
}

pub fn verify_openid_jwt(
    jwt: &str,
    issuers: &[&str],
    client_id: &str,
    jwks: &[Jwk],
    expected_nonce: &str,
) -> Result<TokenData<Claims>, JwtVerifyError> {
    // 1) Read header to get `kid`
    let header = decode_jwt_header(jwt).map_err(JwtVerifyError::from)?;

    let kid = header.kid.ok_or(JwtVerifyError::MissingKid)?;

    // 2) Find matching RSA key
    let jwk = pick_key(&kid, jwks).ok_or(JwtVerifyError::NoKeyForKid)?;

    // 3) Build decoding key
    let key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| JwtVerifyError::BadSig(e.to_string()))?;

    // 4) Build validation but disable automatic audience validation
    let mut val = Validation::new(Algorithm::RS256);

    // The forked library uses IC time for time-based checks.

    // We treat the ID token as a fresh proof of identity, so we ignore long-lived expiration (`exp`).
    // We enforce our own short window using update timestamp (`iat`) - 10 minutes currently.
    val.validate_exp = false;

    // We use the library to enforce "not before" (`nbf`) if present.
    // Not strictly required (we already check `iat` freshness), but it doesn't hurt.
    val.validate_nbf = true;

    // Let the lib check issuer
    val.set_issuer(issuers);

    // Disable aud checks — we’ll handle audience manually
    val.validate_aud = false;

    let token =
        decode::<Claims>(jwt, &key, &val).map_err(|e| JwtVerifyError::BadSig(e.to_string()))?;

    // 5) Manual checks audience
    let c = &token.claims;
    if c.aud != client_id {
        return Err(JwtVerifyError::BadClaim("aud".to_string()));
    }

    // 6) Assert it is the expected nonce
    if c.nonce.as_deref() != Some(expected_nonce) {
        return Err(JwtVerifyError::BadClaim("nonce".to_string()));
    }

    // 7) Assert expiration
    let now_ns = ic_cdk::api::time();
    const MAX_VALIDITY_WINDOW_NS: u64 = 10 * 60 * 1_000_000_000; // 10 min
    const IAT_FUTURE_SKEW_NS: u64 = 2 * 60 * 1_000_000_000; // 2 min

    let iat_s = c.iat.ok_or(JwtVerifyError::BadClaim("iat".to_string()))?;
    let iat_ns = iat_s.saturating_mul(1_000_000_000);

    // Reject if token is from the future
    // Note: in practice we noticed that using exactly iat for this comparison
    // lead to issue. That is why we add a bit of buffer to the comparison.
    if now_ns < iat_ns.saturating_sub(IAT_FUTURE_SKEW_NS) {
        return Err(JwtVerifyError::BadClaim("iat_future".to_string()));
    }

    // Reject if too old
    if now_ns > iat_ns.saturating_add(MAX_VALIDITY_WINDOW_NS) {
        return Err(JwtVerifyError::BadClaim("iat_expired".to_string()));
    }

    Ok(token)
}

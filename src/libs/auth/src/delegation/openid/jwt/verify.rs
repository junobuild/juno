use crate::delegation::openid::jwt::types::{Claims, Jwk};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, TokenData, Validation};

#[derive(Debug)]
pub enum VerifyErr {
    MissingKid,
    NoKeyForKid,
    BadSig(String),
    BadClaim(&'static str),
}

impl core::fmt::Display for VerifyErr {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        match self {
            VerifyErr::MissingKid => write!(f, "missing kid"),
            VerifyErr::NoKeyForKid => write!(f, "no key for kid"),
            VerifyErr::BadSig(msg) => write!(f, "bad signature: {msg}"),
            VerifyErr::BadClaim(claim) => write!(f, "bad claim: {claim}"),
        }
    }
}

fn pick_key<'a>(kid: &str, jwks: &'a [Jwk]) -> Option<&'a Jwk> {
    jwks.iter().find(|j| j.kid.as_deref() == Some(kid))
}

pub fn verify_openid_jwt(
    jwt: &str,
    issuers: &[&str],
    client_id: &str,
    jwks: &[Jwk],
    expected_nonce: &str,
) -> Result<TokenData<Claims>, VerifyErr> {
    // 1) read header to get `kid`
    let header = decode_header(jwt).map_err(|e| VerifyErr::BadSig(e.to_string()))?;

    if header.alg != Algorithm::RS256 {
        return Err(VerifyErr::BadClaim("alg"));
    }

    // If typ is present it must be "JWT".
    if let Some(typ) = header.typ.as_deref() {
        if typ != "JWT" {
            return Err(VerifyErr::BadClaim("typ"));
        }
    }

    let kid = header.kid.ok_or(VerifyErr::MissingKid)?;

    // 2) find matching RSA key
    let jwk = pick_key(&kid, jwks).ok_or(VerifyErr::NoKeyForKid)?;

    // 3) build decoding key
    let key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| VerifyErr::BadSig(e.to_string()))?;

    // 4) build validation but disable automatic audience validation
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

    let token = decode::<Claims>(jwt, &key, &val).map_err(|e| VerifyErr::BadSig(e.to_string()))?;

    // 5) manual checks audience
    let c = &token.claims;
    if c.aud != client_id {
        return Err(VerifyErr::BadClaim("aud"));
    }

    // 6) Assert it is the expected nonce
    if c.nonce.as_deref() != Some(expected_nonce) {
        return Err(VerifyErr::BadClaim("nonce"));
    }

    // 7) Assert expiration
    let now_ns = ic_cdk::api::time();
    const MAX_VALIDITY_WINDOW_NS: u64 = 10 * 60 * 1_000_000_000; // 10 min
    const IAT_FUTURE_SKEW_NS: u64 = 2 * 60 * 1_000_000_000; // 2 min

    let iat_s = c.iat.ok_or(VerifyErr::BadClaim("iat"))?;
    let iat_ns = iat_s.saturating_mul(1_000_000_000);

    // reject if token is from the future
    // Note: in practice we noticed that using exactly iat for this comparison
    // lead to issue. That is why we add a bit of buffer to the comparison.
    if now_ns < iat_ns.saturating_sub(IAT_FUTURE_SKEW_NS) {
        return Err(VerifyErr::BadClaim("iat_future"));
    }

    // reject if too old
    if now_ns > iat_ns.saturating_add(MAX_VALIDITY_WINDOW_NS) {
        return Err(VerifyErr::BadClaim("iat_expired"));
    }

    Ok(token)
}

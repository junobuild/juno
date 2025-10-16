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
    let now_ns = now_ns();
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

#[cfg(target_arch = "wasm32")]
fn now_ns() -> u64 {
    ic_cdk::api::time()
}

// For test only
#[cfg(not(target_arch = "wasm32"))]
fn now_ns() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

#[cfg(test)]
mod verify_tests {
    use super::verify_openid_jwt;
    use crate::delegation::openid::jwt::types::{Claims, Jwk, JwtVerifyError};
    use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
    use std::time::{SystemTime, UNIX_EPOCH};

    const TEST_RSA_PEM: &str = include_str!("../../../../tests/keys/test_rsa.pem");

    const N_B64URL: &str = "qtQHkWpyd489-_bWjRtrvlQX9CwiQreOsi6kNeeySznI8u-8sxyuO3spW1r2pRmu-rc4jnD9vY6eTGZ3WFNIMxe1geXsF_3nQc5fcNJUUZj19BZE4Ud3dCmUQ4ezkslTvBj8RgD-iBJL7BT7YpxpPgvmqQy_9IgYUkDW4I9_e6kME5kVpySvpRznlk73PfAaDkHWmUTN0j2WcxkW09SGJ_f-tStaYXtc4uH5J-PWMRjwsfL66A_sxLxAwUODJ0VUbeDxVFHGJa0L-58_6GYDTqeel1vH4XjezDL8lf53YRyva3aFxGrC_JeLuIUaJOJX1hXWQb2DruB4hVcQX9afrQ";
    const E_B64URL: &str = "AQAB";

    const ISS_GOOGLE: &str = "https://accounts.google.com";
    const AUD_OK: &str = "client-123";
    const NONCE_OK: &str = "nonce-xyz";
    const KID_OK: &str = "test-kid-1";

    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn header(typ: Option<&str>, kid: Option<&str>) -> Header {
        let mut h = Header::new(Algorithm::RS256);
        h.typ = typ.map(|t| t.to_string());
        h.kid = kid.map(|k| k.to_string());
        h
    }

    fn claims(
        iss: &str,
        aud: &str,
        iat: Option<u64>,
        nbf: Option<u64>,
        nonce: Option<&str>,
        exp: Option<u64>,
    ) -> Claims {
        Claims {
            iss: iss.into(),
            sub: "sub".into(),
            aud: aud.into(),
            exp,
            nbf,
            iat,
            email: None,
            name: None,
            picture: None,
            nonce: nonce.map(|s| s.into()),
        }
    }

    fn sign_token(h: &Header, c: &Claims) -> String {
        let enc = EncodingKey::from_rsa_pem(TEST_RSA_PEM.as_bytes()).expect("valid pem");
        encode(h, c, &enc).expect("jwt encode")
    }

    fn jwk_with_kid(kid: &str) -> Jwk {
        Jwk {
            kid: Some(kid.into()),
            n: N_B64URL.into(),
            e: E_B64URL.into(),
        }
    }

    #[test]
    fn verifies_ok() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let out = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .expect("should verify");

        assert_eq!(out.claims.iss, ISS_GOOGLE);
        assert_eq!(out.claims.aud, AUD_OK);
        assert_eq!(out.claims.nonce.as_deref(), Some(NONCE_OK));
    }

    #[test]
    fn missing_kid() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), None),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::MissingKid));
    }

    #[test]
    fn no_key_for_kid() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some("kid-unknown")),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::NoKeyForKid));
    }

    #[test]
    fn wrong_issuer_is_badsig_from_lib() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                "https://not.google.example",
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        // Validation.set_issuer rejects this → mapped to BadSig
        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadSig(_)));
    }

    #[test]
    fn wrong_typ_is_badclaim_typ() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JOT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadClaim(ref f) if f == "typ"));
    }

    #[test]
    fn bad_audience() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                "wrong-aud",
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadClaim(ref f) if f == "aud"));
    }

    #[test]
    fn bad_nonce() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some("nope"),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadClaim(ref f) if f == "nonce"));
    }

    #[test]
    fn iat_too_far_in_future() {
        let now = now_secs();
        let future = now + 4 * 60; // +4min, threshold is 2min skew
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(future),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadClaim(ref f) if f == "iat_future"));
    }

    #[test]
    fn iat_too_old() {
        let now = now_secs();
        let old = now.saturating_sub(11 * 60); // >10 min
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(old),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadClaim(ref f) if f == "iat_expired"));
    }

    #[test]
    fn nbf_in_future_is_rejected_by_lib() {
        let now = now_secs();
        let nbf_future = now + 300; // +5 min
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                Some(nbf_future),
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        // validate_nbf = true -> jsonwebtoken rejects -> BadSig
        let err = verify_openid_jwt(
            &token,
            &[ISS_GOOGLE],
            AUD_OK,
            &[jwk_with_kid(KID_OK)],
            NONCE_OK,
        )
        .unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadSig(_)));
    }

    #[test]
    fn bad_signature_with_wrong_key_material() {
        let now = now_secs();
        let token = sign_token(
            &header(Some("JWT"), Some(KID_OK)),
            &claims(
                ISS_GOOGLE,
                AUD_OK,
                Some(now),
                None,
                Some(NONCE_OK),
                Some(now + 600),
            ),
        );

        // Break the modulus slightly so the provided JWK doesn't match the signature
        // (change the last char; still valid base64url but wrong key)
        let mut bad_n = N_B64URL.to_string();
        let last = bad_n.pop().unwrap();
        bad_n.push(if last == 'A' { 'B' } else { 'A' });

        let bad_jwk = Jwk {
            kid: Some(KID_OK.into()),
            n: bad_n,
            e: E_B64URL.into(),
        };

        let err =
            verify_openid_jwt(&token, &[ISS_GOOGLE], AUD_OK, &[bad_jwk], NONCE_OK).unwrap_err();
        assert!(matches!(err, JwtVerifyError::BadSig(_)));
    }
}

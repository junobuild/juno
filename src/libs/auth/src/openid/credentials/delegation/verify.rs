use crate::openid::credentials::delegation::types::interface::OpenIdDelegationCredential;
use crate::openid::credentials::delegation::types::token::DelegationClaims;
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use crate::openid::jwkset::{get_jwks, get_or_refresh_jwks};
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::errors::JwtVerifyError;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt};
use crate::openid::types::provider::OpenIdDelegationProvider;
use crate::openid::types::provider::OpenIdProvider;
use crate::state::types::config::{OpenIdAuthProviderClientId, OpenIdAuthProviders};
use crate::state::types::state::Salt;
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdDelegationCredentialsResult =
    Result<(OpenIdDelegationCredential, OpenIdDelegationProvider), VerifyOpenidCredentialsError>;

/// Verifies delegation OIDC credentials (e.g. Google, GitHub) and returns the credential.
///
/// Replay protection is enforced via nonce validation using the provided salt and caller().
pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdAuthProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdDelegationCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&delegation_provider).into();

    let jwks = get_or_refresh_jwks(&provider, jwt, auth_heap)
        .await
        .map_err(VerifyOpenidCredentialsError::GetOrFetchJwks)?;

    verify_openid_credentials(jwt, &jwks, &delegation_provider, &config.client_id, salt)
}

pub fn verify_openid_credentials_with_cached_jwks(
    jwt: &str,
    salt: &Salt,
    providers: &OpenIdAuthProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdDelegationCredentialsResult {
    let (delegation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&delegation_provider).into();

    let jwks = get_jwks(&provider, auth_heap).ok_or(VerifyOpenidCredentialsError::GetCachedJwks)?;

    verify_openid_credentials(jwt, &jwks, &delegation_provider, &config.client_id, salt)
}

fn verify_openid_credentials(
    jwt: &str,
    jwks: &Jwks,
    provider: &OpenIdDelegationProvider,
    client_id: &OpenIdAuthProviderClientId,
    salt: &Salt,
) -> VerifyOpenIdDelegationCredentialsResult {
    let assert_nonce = |claims: &DelegationClaims, nonce: &String| -> Result<(), JwtVerifyError> {
        if claims.nonce.as_deref() != Some(nonce.as_str()) {
            return Err(JwtVerifyError::BadClaim("nonce".to_string()));
        }

        Ok(())
    };

    let assert_audience = |claims: &DelegationClaims| -> Result<(), JwtVerifyError> {
        if claims.aud != client_id.as_str() {
            return Err(JwtVerifyError::BadClaim("aud".to_string()));
        }

        Ok(())
    };

    let token = verify_openid_jwt(
        jwt,
        provider.issuers(),
        &jwks.keys,
        salt,
        assert_nonce,
        assert_audience,
    )
    .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    let credential = OpenIdDelegationCredential::from(token);

    Ok((credential, provider.clone()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::openid::jwt::types::cert::{Jwk, JwkParams, JwkParamsRsa, JwkType, Jwks};
    use crate::openid::types::provider::OpenIdDelegationProvider;
    use crate::openid::utils::nonce::build_nonce;
    use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
    use std::time::{SystemTime, UNIX_EPOCH};

    const TEST_RSA_PEM: &str = include_str!("../../../../tests/keys/test_rsa.pem");
    const N_B64URL: &str = "qtQHkWpyd489-_bWjRtrvlQX9CwiQreOsi6kNeeySznI8u-8sxyuO3spW1r2pRmu-rc4jnD9vY6eTGZ3WFNIMxe1geXsF_3nQc5fcNJUUZj19BZE4Ud3dCmUQ4ezkslTvBj8RgD-iBJL7BT7YpxpPgvmqQy_9IgYUkDW4I9_e6kME5kVpySvpRznlk73PfAaDkHWmUTN0j2WcxkW09SGJ_f-tStaYXtc4uH5J-PWMRjwsfL66A_sxLxAwUODJ0VUbeDxVFHGJa0L-58_6GYDTqeel1vH4XjezDL8lf53YRyva3aFxGrC_JeLuIUaJOJX1hXWQb2DruB4hVcQX9afrQ";
    const E_B64URL: &str = "AQAB";
    const KID: &str = "test-kid";
    const ISS_GOOGLE: &str = "https://accounts.google.com";
    const CLIENT_ID: &str = "test-client-id";

    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    fn test_salt() -> Salt {
        [42u8; 32]
    }

    fn test_jwks() -> Jwks {
        Jwks {
            keys: vec![Jwk {
                kty: JwkType::Rsa,
                alg: Some("RS256".into()),
                kid: Some(KID.into()),
                params: JwkParams::Rsa(JwkParamsRsa {
                    n: N_B64URL.into(),
                    e: E_B64URL.into(),
                }),
            }],
        }
    }

    fn create_token(claims: &DelegationClaims) -> String {
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(KID.into());
        header.typ = Some("JWT".into());

        let key = EncodingKey::from_rsa_pem(TEST_RSA_PEM.as_bytes()).unwrap();
        encode(&header, claims, &key).unwrap()
    }

    #[test]
    fn verifies_valid_delegation_credentials() {
        let now = now_secs();
        let salt = test_salt();
        let nonce = build_nonce(&salt);

        let claims = DelegationClaims {
            iss: ISS_GOOGLE.into(),
            sub: "user-123".into(),
            aud: CLIENT_ID.into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            nonce: Some(nonce),
            email: Some("test@example.com".into()),
            name: Some("Test User".into()),
            given_name: None,
            family_name: None,
            preferred_username: None,
            picture: None,
            locale: None,
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();

        let result = verify_openid_credentials(
            &jwt,
            &jwks,
            &OpenIdDelegationProvider::Google,
            &CLIENT_ID.to_string(),
            &salt,
        );

        assert!(result.is_ok());
        let (credential, provider) = result.unwrap();
        assert_eq!(provider, OpenIdDelegationProvider::Google);
        assert_eq!(credential.email, Some("test@example.com".into()));
    }

    #[test]
    fn rejects_wrong_audience() {
        let now = now_secs();
        let salt = test_salt();
        let nonce = build_nonce(&salt);

        let claims = DelegationClaims {
            iss: ISS_GOOGLE.into(),
            sub: "user-123".into(),
            aud: "wrong-client-id".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            nonce: Some(nonce),
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            preferred_username: None,
            picture: None,
            locale: None,
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();

        let result = verify_openid_credentials(
            &jwt,
            &jwks,
            &OpenIdDelegationProvider::Google,
            &CLIENT_ID.to_string(),
            &salt,
        );

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VerifyOpenidCredentialsError::JwtVerify(JwtVerifyError::BadClaim(ref c)) if c == "aud"
        ));
    }

    #[test]
    fn rejects_wrong_nonce() {
        let now = now_secs();
        let salt = test_salt();

        let claims = DelegationClaims {
            iss: ISS_GOOGLE.into(),
            sub: "user-123".into(),
            aud: CLIENT_ID.into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            nonce: Some("wrong-nonce".into()),
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            preferred_username: None,
            picture: None,
            locale: None,
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();

        let result = verify_openid_credentials(
            &jwt,
            &jwks,
            &OpenIdDelegationProvider::Google,
            &CLIENT_ID.to_string(),
            &salt,
        );

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VerifyOpenidCredentialsError::JwtVerify(JwtVerifyError::BadClaim(ref c)) if c == "nonce"
        ));
    }

    #[test]
    fn decodes_all_profile_fields() {
        let now = now_secs();
        let salt = test_salt();
        let nonce = build_nonce(&salt);

        let claims = DelegationClaims {
            iss: ISS_GOOGLE.into(),
            sub: "user-123".into(),
            aud: CLIENT_ID.into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            nonce: Some(nonce),
            email: Some("hello@example.com".into()),
            name: Some("Hello World".into()),
            given_name: Some("Hello".into()),
            family_name: Some("World".into()),
            preferred_username: Some("hello_world".into()),
            picture: Some("https://example.com/pic.png".into()),
            locale: Some("en-US".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();

        let result = verify_openid_credentials(
            &jwt,
            &jwks,
            &OpenIdDelegationProvider::Google,
            &CLIENT_ID.to_string(),
            &salt,
        );

        assert!(result.is_ok());
        let (credential, _) = result.unwrap();
        assert_eq!(credential.email.as_deref(), Some("hello@example.com"));
        assert_eq!(credential.name.as_deref(), Some("Hello World"));
        assert_eq!(credential.given_name.as_deref(), Some("Hello"));
        assert_eq!(credential.family_name.as_deref(), Some("World"));
        assert_eq!(
            credential.preferred_username.as_deref(),
            Some("hello_world")
        );
        assert_eq!(
            credential.picture.as_deref(),
            Some("https://example.com/pic.png")
        );
        assert_eq!(credential.locale.as_deref(), Some("en-US"));
    }
}

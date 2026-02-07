use crate::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use crate::openid::credentials::automation::types::token::AutomationClaims;
use crate::openid::credentials::types::errors::VerifyOpenidCredentialsError;
use crate::openid::jwkset::get_or_refresh_jwks;
use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::errors::JwtVerifyError;
use crate::openid::jwt::{unsafe_find_jwt_provider, verify_openid_jwt};
use crate::openid::types::provider::{OpenIdAutomationProvider, OpenIdProvider};
use crate::state::types::automation::{
    OpenIdAutomationProviderConfig, OpenIdAutomationProviders, RepositoryKey,
};
use crate::strategies::AuthHeapStrategy;

type VerifyOpenIdAutomationCredentialsResult =
    Result<(OpenIdAutomationCredential, OpenIdAutomationProvider), VerifyOpenidCredentialsError>;

/// Verifies automation OIDC credentials (e.g. GitHub Actions) and returns the credential.
///
/// ⚠️ **Warning:** This function does NOT enforce replay protection via JTI tracking.
///
/// The caller MUST implement a replay protection. For example:
/// - Checking if the `jti` claim has been used before
/// - Storing the `jti` after successful verification
/// - Rejecting tokens with duplicate `jti` values
///
/// In the Satellite implementation, this is handled by `save_unique_token_jti()`.
pub async fn verify_openid_credentials_with_jwks_renewal(
    jwt: &str,
    providers: &OpenIdAutomationProviders,
    auth_heap: &impl AuthHeapStrategy,
) -> VerifyOpenIdAutomationCredentialsResult {
    let (automation_provider, config) = unsafe_find_jwt_provider(providers, jwt)
        .map_err(VerifyOpenidCredentialsError::JwtFindProvider)?;

    let provider: OpenIdProvider = (&automation_provider).into();

    let jwks = get_or_refresh_jwks(&provider, jwt, auth_heap)
        .await
        .map_err(VerifyOpenidCredentialsError::GetOrFetchJwks)?;

    verify_openid_credentials(jwt, &jwks, &automation_provider, config)
}

fn verify_openid_credentials(
    jwt: &str,
    jwks: &Jwks,
    provider: &OpenIdAutomationProvider,
    config: &OpenIdAutomationProviderConfig,
) -> VerifyOpenIdAutomationCredentialsResult {
    let assert_audience = |_claims: &AutomationClaims| -> Result<(), JwtVerifyError> {
        // TODO: assert caller is audience

        Ok(())
    };

    let assert_repository = |claims: &AutomationClaims| -> Result<(), JwtVerifyError> {
        let repository = claims
            .repository
            .as_ref()
            .ok_or_else(|| JwtVerifyError::BadClaim("repository".to_string()))?;

        let parts: Vec<&str> = repository.split('/').collect();
        if parts.len() != 2 {
            return Err(JwtVerifyError::BadClaim("repository_format".to_string()));
        }

        let repo_key = RepositoryKey {
            owner: parts[0].to_string(),
            name: parts[1].to_string(),
        };

        let repo_config = config
            .repositories
            .get(&repo_key)
            .ok_or_else(|| JwtVerifyError::BadClaim("repository_unauthorized".to_string()))?;

        if let Some(allowed_branches) = &repo_config.branches {
            let ref_claim = claims
                .r#ref
                .as_ref()
                .ok_or_else(|| JwtVerifyError::BadClaim("ref".to_string()))?;

            // ref is like "refs/heads/main", extract branch name
            let branch = ref_claim
                .strip_prefix("refs/heads/")
                .ok_or_else(|| JwtVerifyError::BadClaim("ref_format".to_string()))?;

            if !allowed_branches.contains(&branch.to_string()) {
                return Err(JwtVerifyError::BadClaim("branch_unauthorized".to_string()));
            }
        }

        Ok(())
    };

    let token = verify_openid_jwt(
        jwt,
        provider.issuers(),
        &jwks.keys,
        assert_audience,
        assert_repository,
    )
    .map_err(VerifyOpenidCredentialsError::JwtVerify)?;

    let credential = OpenIdAutomationCredential::from(token);

    Ok((credential, provider.clone()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::openid::jwt::types::cert::{Jwk, JwkParams, JwkParamsRsa, JwkType, Jwks};
    use crate::openid::types::provider::OpenIdAutomationProvider;
    use crate::state::types::automation::{
        OpenIdAutomationProviderConfig, OpenIdAutomationRepositories,
        OpenIdAutomationRepositoryConfig, RepositoryKey,
    };
    use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
    use std::collections::HashMap;
    use std::time::{SystemTime, UNIX_EPOCH};

    const TEST_RSA_PEM: &str = include_str!("../../../../tests/keys/test_rsa.pem");
    const N_B64URL: &str = "qtQHkWpyd489-_bWjRtrvlQX9CwiQreOsi6kNeeySznI8u-8sxyuO3spW1r2pRmu-rc4jnD9vY6eTGZ3WFNIMxe1geXsF_3nQc5fcNJUUZj19BZE4Ud3dCmUQ4ezkslTvBj8RgD-iBJL7BT7YpxpPgvmqQy_9IgYUkDW4I9_e6kME5kVpySvpRznlk73PfAaDkHWmUTN0j2WcxkW09SGJ_f-tStaYXtc4uH5J-PWMRjwsfL66A_sxLxAwUODJ0VUbeDxVFHGJa0L-58_6GYDTqeel1vH4XjezDL8lf53YRyva3aFxGrC_JeLuIUaJOJX1hXWQb2DruB4hVcQX9afrQ";
    const E_B64URL: &str = "AQAB";
    const KID: &str = "test-kid";
    const ISS_GITHUB_ACTIONS: &str = "https://token.actions.githubusercontent.com";

    fn now_secs() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
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

    fn test_config() -> OpenIdAutomationProviderConfig {
        let mut repositories: OpenIdAutomationRepositories = HashMap::new();

        repositories.insert(
            RepositoryKey {
                owner: "octo-org".to_string(),
                name: "octo-repo".to_string(),
            },
            OpenIdAutomationRepositoryConfig {
                branches: Some(vec!["main".to_string(), "develop".to_string()]),
            },
        );

        OpenIdAutomationProviderConfig {
            repositories,
            controller: None,
        }
    }

    fn create_token(claims: &AutomationClaims) -> String {
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(KID.into());
        header.typ = Some("JWT".into());

        let key = EncodingKey::from_rsa_pem(TEST_RSA_PEM.as_bytes()).unwrap();
        encode(&header, claims, &key).unwrap()
    }

    #[test]
    fn verifies_valid_automation_credentials() {
        let now = now_secs();

        let claims = AutomationClaims {
            iss: ISS_GITHUB_ACTIONS.into(),
            sub: "repo:octo-org/octo-repo:ref:refs/heads/main".into(),
            aud: "https://github.com/octo-org".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            jti: Some("example-id".into()),
            repository: Some("octo-org/octo-repo".into()),
            repository_owner: Some("octo-org".into()),
            r#ref: Some("refs/heads/main".into()),
            run_id: Some("123456".into()),
            run_number: Some("1".into()),
            run_attempt: Some("1".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();
        let config = test_config();

        let result =
            verify_openid_credentials(&jwt, &jwks, &OpenIdAutomationProvider::GitHub, &config);

        assert!(result.is_ok());
        let (credential, provider) = result.unwrap();
        assert_eq!(provider, OpenIdAutomationProvider::GitHub);
        assert_eq!(credential.repository.as_deref(), Some("octo-org/octo-repo"));
        assert_eq!(credential.r#ref.as_deref(), Some("refs/heads/main"));
    }

    #[test]
    fn rejects_unauthorized_repository() {
        let now = now_secs();

        let claims = AutomationClaims {
            iss: ISS_GITHUB_ACTIONS.into(),
            sub: "repo:other-org/other-repo:ref:refs/heads/main".into(),
            aud: "https://github.com/other-org".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            jti: Some("example-id".into()),
            repository: Some("other-org/other-repo".into()),
            repository_owner: Some("other-org".into()),
            r#ref: Some("refs/heads/main".into()),
            run_id: Some("123456".into()),
            run_number: Some("1".into()),
            run_attempt: Some("1".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();
        let config = test_config();

        let result =
            verify_openid_credentials(&jwt, &jwks, &OpenIdAutomationProvider::GitHub, &config);

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VerifyOpenidCredentialsError::JwtVerify(JwtVerifyError::BadClaim(ref c)) if c == "repository_unauthorized"
        ));
    }

    #[test]
    fn rejects_unauthorized_branch() {
        let now = now_secs();

        let claims = AutomationClaims {
            iss: ISS_GITHUB_ACTIONS.into(),
            sub: "repo:octo-org/octo-repo:ref:refs/heads/feature".into(),
            aud: "https://github.com/octo-org".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            jti: Some("example-id".into()),
            repository: Some("octo-org/octo-repo".into()),
            repository_owner: Some("octo-org".into()),
            r#ref: Some("refs/heads/feature".into()),
            run_id: Some("123456".into()),
            run_number: Some("1".into()),
            run_attempt: Some("1".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();
        let config = test_config();

        let result =
            verify_openid_credentials(&jwt, &jwks, &OpenIdAutomationProvider::GitHub, &config);

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VerifyOpenidCredentialsError::JwtVerify(JwtVerifyError::BadClaim(ref c)) if c == "branch_unauthorized"
        ));
    }

    #[test]
    fn allows_all_branches_when_not_configured() {
        let now = now_secs();

        let mut repositories: OpenIdAutomationRepositories = HashMap::new();
        repositories.insert(
            RepositoryKey {
                owner: "octo-org".to_string(),
                name: "octo-repo".to_string(),
            },
            OpenIdAutomationRepositoryConfig { branches: None },
        );

        let config = OpenIdAutomationProviderConfig {
            repositories,
            controller: None,
        };

        let claims = AutomationClaims {
            iss: ISS_GITHUB_ACTIONS.into(),
            sub: "repo:octo-org/octo-repo:ref:refs/heads/any-branch".into(),
            aud: "https://github.com/octo-org".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            jti: Some("example-id".into()),
            repository: Some("octo-org/octo-repo".into()),
            repository_owner: Some("octo-org".into()),
            r#ref: Some("refs/heads/any-branch".into()),
            run_id: Some("123456".into()),
            run_number: Some("1".into()),
            run_attempt: Some("1".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();

        let result =
            verify_openid_credentials(&jwt, &jwks, &OpenIdAutomationProvider::GitHub, &config);

        assert!(result.is_ok());
    }

    #[test]
    fn rejects_missing_repository_claim() {
        let now = now_secs();

        let claims = AutomationClaims {
            iss: ISS_GITHUB_ACTIONS.into(),
            sub: "repo:octo-org/octo-repo:ref:refs/heads/main".into(),
            aud: "https://github.com/octo-org".into(),
            iat: Some(now),
            exp: Some(now + 600),
            nbf: None,
            jti: Some("example-id".into()),
            repository: None, // Missing
            repository_owner: Some("octo-org".into()),
            r#ref: Some("refs/heads/main".into()),
            run_id: Some("123456".into()),
            run_number: Some("1".into()),
            run_attempt: Some("1".into()),
        };

        let jwt = create_token(&claims);
        let jwks = test_jwks();
        let config = test_config();

        let result =
            verify_openid_credentials(&jwt, &jwks, &OpenIdAutomationProvider::GitHub, &config);

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            VerifyOpenidCredentialsError::JwtVerify(JwtVerifyError::BadClaim(ref c)) if c == "repository"
        ));
    }
}

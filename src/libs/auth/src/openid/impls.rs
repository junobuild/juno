use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::provider::JwtIssuers;
use crate::openid::types::provider::{OpenIdCertificate, OpenIdDelegationProvider, OpenIdProvider};
use junobuild_shared::data::version::next_version;
use junobuild_shared::ic::api::time;
use junobuild_shared::types::state::{Version, Versioned};
use std::fmt::{Display, Formatter, Result as FmtResult};

impl OpenIdProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => "https://www.googleapis.com/oauth2/v3/certs",
            // Swap for local development with the Juno API:
            // http://host.docker.internal:3000/v1/auth/certs
            Self::GitHubAuth => "https://api.juno.build/v1/auth/certs",
        }
    }

    pub fn issuers(&self) -> &[&'static str] {
        match self {
            OpenIdProvider::Google => &["https://accounts.google.com", "accounts.google.com"],
            OpenIdProvider::GitHubAuth => &["https://api.juno.build/auth/github"],
        }
    }
}

impl From<&OpenIdDelegationProvider> for OpenIdProvider {
    fn from(delegation_provider: &OpenIdDelegationProvider) -> Self {
        match delegation_provider {
            OpenIdDelegationProvider::Google => OpenIdProvider::Google,
            OpenIdDelegationProvider::GitHub => OpenIdProvider::GitHubAuth,
        }
    }
}

impl OpenIdDelegationProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => OpenIdProvider::Google.jwks_url(),
            Self::GitHub => OpenIdProvider::GitHubAuth.jwks_url(),
        }
    }

    pub fn issuers(&self) -> &[&'static str] {
        match self {
            Self::Google => OpenIdProvider::Google.issuers(),
            Self::GitHub => OpenIdProvider::GitHubAuth.issuers(),
        }
    }
}

impl JwtIssuers for OpenIdDelegationProvider {
    fn issuers(&self) -> &[&'static str] {
        self.issuers()
    }
}

impl Versioned for OpenIdCertificate {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

impl OpenIdCertificate {
    fn get_next_version(current_certificate: &Option<OpenIdCertificate>) -> Version {
        next_version(current_certificate)
    }

    pub fn init(jwks: &Jwks) -> Self {
        let now = time();

        let version = Self::get_next_version(&None);

        Self {
            jwks: jwks.clone(),
            created_at: now,
            updated_at: now,
            version: Some(version),
        }
    }

    pub fn update(current_certificate: &OpenIdCertificate, jwks: &Jwks) -> Self {
        let now = time();

        let version = Self::get_next_version(&Some(current_certificate.clone()));

        Self {
            jwks: jwks.clone(),
            updated_at: now,
            version: Some(version),
            ..current_certificate.clone()
        }
    }
}

impl Display for OpenIdProvider {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        match self {
            OpenIdProvider::Google => write!(f, "Google"),
            OpenIdProvider::GitHubAuth => write!(f, "GitHub"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_openid_provider_jwks_urls() {
        assert_eq!(
            OpenIdProvider::Google.jwks_url(),
            "https://www.googleapis.com/oauth2/v3/certs"
        );
        assert_eq!(
            OpenIdProvider::GitHubAuth.jwks_url(),
            "https://api.juno.build/v1/auth/certs"
        );
    }

    #[test]
    fn test_openid_provider_issuers() {
        assert_eq!(
            OpenIdProvider::Google.issuers(),
            &["https://accounts.google.com", "accounts.google.com"]
        );
        assert_eq!(
            OpenIdProvider::GitHubAuth.issuers(),
            &["https://api.juno.build/auth/github"]
        );
    }

    #[test]
    fn test_delegation_provider_to_openid_provider() {
        assert_eq!(
            OpenIdProvider::from(&OpenIdDelegationProvider::Google),
            OpenIdProvider::Google
        );
        assert_eq!(
            OpenIdProvider::from(&OpenIdDelegationProvider::GitHub),
            OpenIdProvider::GitHubAuth
        );
    }

    #[test]
    fn test_delegation_provider_jwks_urls() {
        assert_eq!(
            OpenIdDelegationProvider::Google.jwks_url(),
            "https://www.googleapis.com/oauth2/v3/certs"
        );
        assert_eq!(
            OpenIdDelegationProvider::GitHub.jwks_url(),
            "https://api.juno.build/v1/auth/certs"
        );
    }

    #[test]
    fn test_delegation_provider_issuers() {
        assert_eq!(
            OpenIdDelegationProvider::Google.issuers(),
            &["https://accounts.google.com", "accounts.google.com"]
        );
        assert_eq!(
            OpenIdDelegationProvider::GitHub.issuers(),
            &["https://api.juno.build/auth/github"]
        );
    }

    #[test]
    fn test_openid_certificate_init() {
        let jwks = Jwks { keys: vec![] };
        let cert = OpenIdCertificate::init(&jwks);

        assert_eq!(cert.version, Some(1));
        assert_eq!(cert.created_at, cert.updated_at);
    }

    #[test]
    fn test_openid_certificate_update() {
        let jwks = Jwks { keys: vec![] };
        let initial = OpenIdCertificate::init(&jwks);

        let new_jwks = Jwks { keys: vec![] };
        let updated = OpenIdCertificate::update(&initial, &new_jwks);

        assert_eq!(updated.version, Some(2));
        assert_eq!(updated.created_at, initial.created_at);
        assert!(updated.updated_at >= initial.updated_at);
    }

    #[test]
    fn test_openid_provider_display() {
        assert_eq!(format!("{}", OpenIdProvider::Google), "Google");
        assert_eq!(format!("{}", OpenIdProvider::GitHubAuth), "GitHub");
    }
}

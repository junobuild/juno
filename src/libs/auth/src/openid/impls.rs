use crate::openid::jwt::types::cert::Jwks;
use crate::openid::types::provider::{OpenIdCertificate, OpenIdDelegationProvider, OpenIdProvider};
use ic_cdk::api::time;
use junobuild_shared::data::version::next_version;
use junobuild_shared::types::state::{Version, Versioned};
use std::fmt::{Display, Formatter, Result as FmtResult};

impl OpenIdProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => "https://www.googleapis.com/oauth2/v3/certs",
            // Swap for local development with the Juno API:
            // http://host.docker.internal:3000/v1/auth/certs
            Self::GitHubAuth => "https://api.juno.build/v1/auth/certs",
            Self::GitHubActions => "https://token.actions.githubusercontent.com/.well-known/jwks",
        }
    }

    pub fn issuers(&self) -> &[&'static str] {
        match self {
            OpenIdProvider::Google => &["https://accounts.google.com", "accounts.google.com"],
            OpenIdProvider::GitHubAuth => &["https://api.juno.build/auth/github"],
            OpenIdProvider::GitHubActions => &["https://token.actions.githubusercontent.com"],
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
            OpenIdProvider::GitHubAuth => write!(f, "GitHub Proxy"),
            OpenIdProvider::GitHubActions => write!(f, "GitHub Actions"),
        }
    }
}

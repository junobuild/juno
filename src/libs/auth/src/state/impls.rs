use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
use crate::state::types::config::{AuthenticationConfig, OpenIdAuthProvider};
use crate::state::types::interface::SetAuthenticationConfig;
use crate::state::types::state::{OpenIdCachedCertificate, OpenIdLastFetchAttempt};
use ic_cdk::api::time;
use junobuild_shared::data::version::next_version;
use junobuild_shared::types::state::{Timestamp, Version, Versioned};

impl AuthenticationConfig {
    pub fn prepare(
        current_config: &Option<AuthenticationConfig>,
        user_config: &SetAuthenticationConfig,
    ) -> Self {
        let now = time();

        let created_at: Timestamp = match current_config {
            None => now,
            Some(current_doc) => current_doc.created_at.unwrap_or(now),
        };

        let version = next_version(current_config);

        let updated_at: Timestamp = now;

        AuthenticationConfig {
            internet_identity: user_config.internet_identity.clone(),
            openid: user_config.openid.clone(),
            rules: user_config.rules.clone(),
            created_at: Some(created_at),
            updated_at: Some(updated_at),
            version: Some(version),
        }
    }
}

impl Versioned for AuthenticationConfig {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

impl AuthenticationConfig {
    pub fn openid_enabled(&self) -> bool {
        self.openid
            .as_ref()
            .is_some_and(|openid| !openid.providers.is_empty())
    }
}

impl OpenIdCachedCertificate {
    pub fn init() -> Self {
        Self {
            certificate: None,
            last_fetch_attempt: OpenIdLastFetchAttempt {
                at: time(),
                streak_count: 1,
            },
        }
    }

    pub fn record_attempt(&mut self, reset_streak: bool) {
        self.last_fetch_attempt.at = time();

        if reset_streak {
            self.last_fetch_attempt.streak_count = 1;
        } else {
            self.last_fetch_attempt.streak_count =
                self.last_fetch_attempt.streak_count.saturating_add(1);
        }
    }

    pub fn update_certificate(&mut self, certificate: &OpenIdCertificate) {
        self.certificate = Some(certificate.clone());
        self.last_fetch_attempt.streak_count = 0;
    }
}


impl TryFrom<&OpenIdProvider> for OpenIdAuthProvider {
    type Error = String;

    fn try_from(provider: &OpenIdProvider) -> Result<Self, Self::Error> {
        match provider {
            OpenIdProvider::Google => Ok(OpenIdAuthProvider::Google),
            OpenIdProvider::GitHubProxy => Ok(OpenIdAuthProvider::GitHub),
            _ => Err(format!(
                "{:?} is not supported for user authentication",
                provider
            )),
        }
    }
}

impl From<&OpenIdAuthProvider> for OpenIdProvider {
    fn from(auth_provider: &OpenIdAuthProvider) -> Self {
        match auth_provider {
            OpenIdAuthProvider::Google => OpenIdProvider::Google,
            OpenIdAuthProvider::GitHub => OpenIdProvider::GitHubProxy,
        }
    }
}

impl OpenIdAuthProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => OpenIdProvider::Google.jwks_url(),
            Self::GitHub => OpenIdProvider::GitHubProxy.jwks_url(),
        }
    }

    pub fn issuers(&self) -> &[&'static str] {
        match self {
            Self::Google => OpenIdProvider::Google.issuers(),
            Self::GitHub => OpenIdProvider::GitHubProxy.issuers(),
        }
    }
}
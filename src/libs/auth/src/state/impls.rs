use crate::openid::types::provider::OpenIdCertificate;
use crate::state::types::config::AuthenticationConfig;
use crate::state::types::interface::SetAuthenticationConfig;
use crate::state::types::state::{OpenIdCachedCertificate, OpenIdLastFetchAttempt};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Timestamp, Version, Versioned};
use junobuild_shared::version::next_version;

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

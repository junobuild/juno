use crate::state::types::config::AuthenticationConfig;
use crate::state::types::interface::SetAuthenticationConfig;
use crate::state::types::state::{OpenIdCachedCertificate, OpenIdFetchCertificateResult};
use ic_cdk::api::time;
use junobuild_shared::types::state::{Timestamp, Version, Versioned};
use junobuild_shared::version::next_version;
use crate::openid::types::provider::OpenIdCertificate;

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
            last_fetch_attempt_at: None,
            last_result: None,
        }
    }

    pub fn init_with_fetch_attempt() -> Self {
        let mut cached_certificate = Self::init();
        cached_certificate.update_fetch_attempt();
        cached_certificate
    }

    pub fn init_with_certificate(certificate: &OpenIdCertificate) -> Self {
        let mut cached_certificate = Self::init();
        cached_certificate.update_certificate(certificate);
        cached_certificate
    }

    pub fn init_with_failure() -> Self {
        let mut cached_certificate = Self::init();
        cached_certificate.record_failure();
        cached_certificate
    }

    pub fn update_fetch_attempt(&mut self) {
        self.last_fetch_attempt_at = Some(time());
    }

    pub fn update_certificate(&mut self, certificate: &OpenIdCertificate) {
        self.certificate = Some(certificate.clone());
        self.last_result = Some(OpenIdFetchCertificateResult::Success { at: time() });
    }

    pub fn record_failure(&mut self) {
        let consecutive_failures = match &self.last_result {
            Some(OpenIdFetchCertificateResult::Failure { consecutive_failures, .. }) => {
                consecutive_failures.saturating_add(1)
            }
            _ => 1,
        };

        self.last_result = Some(OpenIdFetchCertificateResult::Failure {
            at: time(),
            consecutive_failures,
        });
    }
}

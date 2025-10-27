use crate::errors::user::{
    JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_WEBAUTHN_INVALID_DATA,
};
use crate::user::core::types::state::{
    AuthProvider, ProviderData, UserData, Validated, WebAuthnData,
};

impl Validated for WebAuthnData {
    fn validate(&self) -> Result<(), String> {
        if let Some(aaguid) = self.aaguid.as_ref() {
            // The AAGUID (Authenticator Attestation GUID) must be exactly 16 bytes.
            // For simplicity, no further validation is performed here; additional checks are deferred to the frontends for display only.
            if aaguid.len() != 16 {
                return Err(JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH.to_string());
            }
        }

        Ok(())
    }
}

impl ProviderData {
    fn validate(&self) -> Result<(), String> {
        match self {
            ProviderData::WebAuthn(data) => data.validate(),
        }
    }

    fn matches_provider(&self, provider: &AuthProvider) -> bool {
        matches!(
            (self, provider),
            (ProviderData::WebAuthn(_), AuthProvider::WebAuthn)
        )
    }
}

impl UserData {
    pub fn assert_provider_data(&self) -> Result<(), String> {
        match self.provider {
            Some(AuthProvider::WebAuthn) => {
                let provider_data = self.provider_data.as_ref().ok_or_else(|| {
                    JUNO_DATASTORE_ERROR_USER_PROVIDER_WEBAUTHN_INVALID_DATA.to_string()
                })?;

                if !provider_data.matches_provider(&AuthProvider::WebAuthn) {
                    return Err(JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA.to_string());
                }

                provider_data.validate()
            }
            _ => {
                // For all other providers, there must be NO provider_data.
                if self.provider_data.is_some() {
                    return Err(JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA.to_string());
                }

                Ok(())
            }
        }
    }
}

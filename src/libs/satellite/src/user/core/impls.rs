use crate::errors::user::{
    JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_WEBAUTHN_INVALID_DATA,
    JUNO_DATASTORE_ERROR_USER_REGISTER_PROVIDER_INVALID_DATA,
};
use crate::user::core::constants::AAGUID_LENGTH;
use crate::user::core::types::state::{
    AuthProvider, OpenIdData, ProviderData, UserData, WebAuthnData,
};
use crate::{Doc, SetDoc};
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_auth::profile::types::{OpenIdProfile, Validated};
use junobuild_utils::encode_doc_data;

impl Validated for WebAuthnData {
    fn validate(&self) -> Result<(), String> {
        if let Some(aaguid) = self.aaguid.as_ref() {
            // The AAGUID (Authenticator Attestation GUID) must be exactly 16 bytes.
            // For simplicity, no further validation is performed here; additional checks are deferred to the frontends for display only.
            if aaguid.len() != AAGUID_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH.to_string());
            }
        }

        Ok(())
    }
}

impl OpenIdProfile for OpenIdData {
    fn email(&self) -> Option<&str> {
        self.email.as_deref()
    }
    fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }
    fn given_name(&self) -> Option<&str> {
        self.given_name.as_deref()
    }
    fn family_name(&self) -> Option<&str> {
        self.family_name.as_deref()
    }
    fn picture(&self) -> Option<&str> {
        self.picture.as_deref()
    }
    fn locale(&self) -> Option<&str> {
        self.locale.as_deref()
    }
}

impl ProviderData {
    fn validate(&self) -> Result<(), String> {
        match self {
            ProviderData::WebAuthn(data) => data.validate(),
            ProviderData::OpenId(data) => data.validate(),
        }
    }

    fn matches_provider(&self, provider: &AuthProvider) -> bool {
        #[allow(clippy::match_like_matches_macro)]
        match (self, provider) {
            (ProviderData::WebAuthn(_), &AuthProvider::WebAuthn) => true,
            (ProviderData::OpenId(_), &AuthProvider::Google) => true,
            _ => false,
        }
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
            Some(AuthProvider::Google) => {
                let provider_data = self.provider_data.as_ref().ok_or_else(|| {
                    JUNO_DATASTORE_ERROR_USER_REGISTER_PROVIDER_INVALID_DATA.to_string()
                })?;

                if !provider_data.matches_provider(&AuthProvider::Google) {
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

    pub fn prepare_set_doc(
        user_data: &UserData,
        current_doc: &Option<Doc>,
    ) -> Result<SetDoc, String> {
        let data = encode_doc_data(user_data)?;

        let set_doc = SetDoc {
            data,
            description: None,
            version: current_doc.as_ref().and_then(|d| d.version),
        };

        Ok(set_doc)
    }
}

impl OpenIdData {
    pub fn merge(existing: &OpenIdData, credential: &OpenIdCredential) -> Self {
        Self {
            email: credential.email.clone().or(existing.email.clone()),
            name: credential.name.clone().or(existing.name.clone()),
            given_name: credential
                .given_name
                .clone()
                .or(existing.given_name.clone()),
            family_name: credential
                .family_name
                .clone()
                .or(existing.family_name.clone()),
            picture: credential.picture.clone().or(existing.picture.clone()),
            locale: credential.locale.clone().or(existing.locale.clone()),
        }
    }
}

impl From<&OpenIdCredential> for OpenIdData {
    fn from(credential: &OpenIdCredential) -> Self {
        Self {
            email: credential.email.clone(),
            name: credential.name.clone(),
            given_name: credential.given_name.clone(),
            family_name: credential.family_name.clone(),
            picture: credential.picture.clone(),
            locale: credential.locale.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::user::core::types::state::{
        AuthProvider, OpenIdData, ProviderData, UserData, WebAuthnData,
    };

    // ------------------------
    // WebAuthnData
    // ------------------------

    #[test]
    fn test_webauthn_valid_aaguid() {
        let data = WebAuthnData {
            aaguid: Some(vec![0; AAGUID_LENGTH]),
        };
        assert!(data.validate().is_ok());
    }

    #[test]
    fn test_webauthn_invalid_aaguid_length() {
        let data = WebAuthnData {
            aaguid: Some(vec![0; 15]),
        };
        let err = data.validate().unwrap_err();
        assert_eq!(err, JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH);
    }

    // ------------------------
    // UserData::assert_provider_data
    // ------------------------

    #[test]
    fn test_userdata_webauthn_valid() {
        let user = UserData {
            provider: Some(AuthProvider::WebAuthn),
            banned: None,
            provider_data: Some(ProviderData::WebAuthn(WebAuthnData {
                aaguid: Some(vec![0; 16]),
            })),
        };
        assert!(user.assert_provider_data().is_ok());
    }

    #[test]
    fn test_userdata_webauthn_missing_data() {
        let user = UserData {
            provider: Some(AuthProvider::WebAuthn),
            banned: None,
            provider_data: None,
        };
        assert!(user.assert_provider_data().is_err());
    }

    #[test]
    fn test_userdata_google_valid() {
        let provider_data = ProviderData::OpenId(OpenIdData {
            email: Some("user@example.com".to_string()),
            name: Some("User".to_string()),
            given_name: None,
            family_name: None,
            picture: Some("https://example.com/avatar.png".to_string()),
            locale: Some("en".to_string()),
        });

        let user = UserData {
            provider: Some(AuthProvider::Google),
            banned: None,
            provider_data: Some(provider_data),
        };

        assert!(user.assert_provider_data().is_ok());
    }

    #[test]
    fn test_userdata_google_invalid_picture_scheme() {
        let provider_data = ProviderData::OpenId(OpenIdData {
            email: Some("user@example.com".to_string()),
            name: Some("User".to_string()),
            given_name: None,
            family_name: None,
            picture: Some("http://example.com/avatar.png".to_string()),
            locale: Some("en".to_string()),
        });

        let user = UserData {
            provider: Some(AuthProvider::Google),
            banned: None,
            provider_data: Some(provider_data),
        };

        assert!(user.assert_provider_data().is_err());
    }

    #[test]
    fn test_userdata_other_provider_no_data() {
        let user = UserData {
            provider: Some(AuthProvider::Nfid),
            banned: None,
            provider_data: None,
        };
        assert!(user.assert_provider_data().is_ok());
    }

    #[test]
    fn test_userdata_other_provider_with_data_fails() {
        let user = UserData {
            provider: Some(AuthProvider::Nfid),
            banned: None,
            provider_data: Some(ProviderData::WebAuthn(WebAuthnData { aaguid: None })),
        };
        assert!(user.assert_provider_data().is_err());
    }
}

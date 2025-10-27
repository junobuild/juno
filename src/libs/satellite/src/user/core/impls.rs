use crate::errors::user::{
    JUNO_DATASTORE_ERROR_USER_AAGUID_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_EMAIL_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_FAMILY_NAME_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_GIVEN_NAME_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_LOCALE_INVALID_LENGTH, JUNO_DATASTORE_ERROR_USER_NAME_INVALID_LENGTH,
    JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_SCHEME,
    JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_URL,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_GOOGLE_INVALID_DATA,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_INVALID_DATA,
    JUNO_DATASTORE_ERROR_USER_PROVIDER_WEBAUTHN_INVALID_DATA,
};
use crate::user::core::constants::{
    AAGUID_LENGTH, EMAIL_MAX_LENGTH, LOCALE_MAX_LENGTH, NAME_MAX_LENGTH, SHORT_NAME_MAX_LENGTH,
};
use crate::user::core::types::state::{
    AuthProvider, GoogleData, ProviderData, UserData, Validated, WebAuthnData,
};
use url::Url;

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

impl Validated for GoogleData {
    fn validate(&self) -> Result<(), String> {
        if let Some(email) = self.email.as_ref() {
            if email.len() > EMAIL_MAX_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_EMAIL_INVALID_LENGTH.to_string());
            }
        }

        if let Some(name) = self.name.as_ref() {
            if name.chars().count() > NAME_MAX_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(given_name) = self.given_name.as_ref() {
            if given_name.chars().count() > SHORT_NAME_MAX_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_GIVEN_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(family_name) = self.family_name.as_ref() {
            if family_name.chars().count() > SHORT_NAME_MAX_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_FAMILY_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(locale) = self.locale.as_ref() {
            if locale.chars().count() > LOCALE_MAX_LENGTH {
                return Err(JUNO_DATASTORE_ERROR_USER_LOCALE_INVALID_LENGTH.to_string());
            }
        }

        if let Some(picture) = self.picture.as_ref() {
            let url = Url::parse(picture)
                .map_err(|_| JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_URL.to_string())?;

            if url.scheme() != "https" {
                return Err(JUNO_DATASTORE_ERROR_USER_PICTURE_INVALID_SCHEME.to_string());
            }
        }

        Ok(())
    }
}

impl ProviderData {
    fn validate(&self) -> Result<(), String> {
        match self {
            ProviderData::WebAuthn(data) => data.validate(),
            ProviderData::Google(data) => data.validate(),
        }
    }

    fn matches_provider(&self, provider: &AuthProvider) -> bool {
        match (self, provider) {
            (ProviderData::WebAuthn(_), &AuthProvider::WebAuthn) => true,
            (ProviderData::Google(_), &AuthProvider::Google) => true,
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
                    JUNO_DATASTORE_ERROR_USER_PROVIDER_GOOGLE_INVALID_DATA.to_string()
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::user::core::types::state::{
        AuthProvider, GoogleData, ProviderData, UserData, WebAuthnData,
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
    // GoogleData
    // ------------------------

    #[test]
    fn test_google_valid_data() {
        let data = GoogleData {
            email: Some("user@example.com".to_string()),
            name: Some("Ada Lovelace".to_string()),
            given_name: Some("Ada".to_string()),
            family_name: Some("Lovelace".to_string()),
            picture: Some("https://example.com/avatar.png".to_string()),
            locale: Some("en".to_string()),
        };

        assert!(data.validate().is_ok());
    }

    #[test]
    fn test_google_invalid_email_length() {
        let long_email = "a".repeat(EMAIL_MAX_LENGTH + 1);
        let data = GoogleData {
            email: Some(long_email),
            name: None,
            given_name: None,
            family_name: None,
            picture: None,
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_picture_url() {
        let data = GoogleData {
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            picture: Some("not-a-valid-url".to_string()),
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_picture_scheme() {
        let data = GoogleData {
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            picture: Some("http://example.com/avatar.png".to_string()),
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_name_length() {
        let data = GoogleData {
            email: None,
            name: Some("a".repeat(NAME_MAX_LENGTH + 1)),
            given_name: None,
            family_name: None,
            picture: None,
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_given_name_length() {
        let data = GoogleData {
            email: None,
            name: None,
            given_name: Some("a".repeat(SHORT_NAME_MAX_LENGTH + 1)),
            family_name: None,
            picture: None,
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_family_name_length() {
        let data = GoogleData {
            email: None,
            name: None,
            given_name: None,
            family_name: Some("a".repeat(SHORT_NAME_MAX_LENGTH + 1)),
            picture: None,
            locale: None,
        };
        assert!(data.validate().is_err());
    }

    #[test]
    fn test_google_invalid_locale_length() {
        let data = GoogleData {
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            picture: None,
            locale: Some("a".repeat(LOCALE_MAX_LENGTH + 1)),
        };
        assert!(data.validate().is_err());
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
        let provider_data = ProviderData::Google(GoogleData {
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
        let provider_data = ProviderData::Google(GoogleData {
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

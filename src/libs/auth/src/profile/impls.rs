use crate::profile::constants::{
    EMAIL_MAX_LENGTH, LOCALE_MAX_LENGTH, NAME_MAX_LENGTH, SHORT_NAME_MAX_LENGTH,
};
use crate::profile::errors::{
    JUNO_AUTH_ERROR_PROFILE_EMAIL_INVALID_LENGTH,
    JUNO_AUTH_ERROR_PROFILE_FAMILY_NAME_INVALID_LENGTH,
    JUNO_AUTH_ERROR_PROFILE_GIVEN_NAME_INVALID_LENGTH,
    JUNO_AUTH_ERROR_PROFILE_LOCALE_INVALID_LENGTH, JUNO_AUTH_ERROR_PROFILE_NAME_INVALID_LENGTH,
    JUNO_AUTH_ERROR_PROFILE_PICTURE_INVALID_SCHEME, JUNO_AUTH_ERROR_PROFILE_PICTURE_INVALID_URL,
};
use crate::profile::types::{OpenIdProfile, Validated};
use url::Url;

impl<T: OpenIdProfile> Validated for T {
    fn validate(&self) -> Result<(), String> {
        if let Some(email) = self.email().as_ref() {
            if email.len() > EMAIL_MAX_LENGTH {
                return Err(JUNO_AUTH_ERROR_PROFILE_EMAIL_INVALID_LENGTH.to_string());
            }
        }

        if let Some(name) = self.name().as_ref() {
            if name.chars().count() > NAME_MAX_LENGTH {
                return Err(JUNO_AUTH_ERROR_PROFILE_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(given_name) = self.given_name().as_ref() {
            if given_name.chars().count() > SHORT_NAME_MAX_LENGTH {
                return Err(JUNO_AUTH_ERROR_PROFILE_GIVEN_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(family_name) = self.family_name().as_ref() {
            if family_name.chars().count() > SHORT_NAME_MAX_LENGTH {
                return Err(JUNO_AUTH_ERROR_PROFILE_FAMILY_NAME_INVALID_LENGTH.to_string());
            }
        }

        if let Some(locale) = self.locale().as_ref() {
            if locale.chars().count() > LOCALE_MAX_LENGTH {
                return Err(JUNO_AUTH_ERROR_PROFILE_LOCALE_INVALID_LENGTH.to_string());
            }
        }

        if let Some(picture) = self.picture().as_ref() {
            let url = Url::parse(picture)
                .map_err(|_| JUNO_AUTH_ERROR_PROFILE_PICTURE_INVALID_URL.to_string())?;

            if url.scheme() != "https" {
                return Err(JUNO_AUTH_ERROR_PROFILE_PICTURE_INVALID_SCHEME.to_string());
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    pub struct OpenIdDataTest {
        pub email: Option<String>,
        pub name: Option<String>,
        pub given_name: Option<String>,
        pub family_name: Option<String>,
        pub picture: Option<String>,
        pub locale: Option<String>,
    }

    impl OpenIdProfile for OpenIdDataTest {
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

    #[test]
    fn test_google_valid_data() {
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
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
        let data = OpenIdDataTest {
            email: None,
            name: None,
            given_name: None,
            family_name: None,
            picture: None,
            locale: Some("a".repeat(LOCALE_MAX_LENGTH + 1)),
        };
        assert!(data.validate().is_err());
    }
}

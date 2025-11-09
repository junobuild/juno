use crate::openid::jwt::types::cert::Jwks;
use crate::openid::jwt::types::token::Claims;
use crate::openid::types::interface::{OpenIdCredential, OpenIdCredentialKey};
use crate::openid::types::provider::{OpenIdCertificate, OpenIdProvider};
use ic_cdk::api::time;
use jsonwebtoken::TokenData;
use junobuild_shared::types::state::{Version, Versioned};
use junobuild_shared::version::next_version;
use std::fmt::{Display, Formatter, Result as FmtResult};

impl From<TokenData<Claims>> for OpenIdCredential {
    fn from(token: TokenData<Claims>) -> Self {
        Self {
            sub: token.claims.sub,
            iss: token.claims.iss,
            email: token.claims.email,
            name: token.claims.name,
            given_name: token.claims.given_name,
            family_name: token.claims.family_name,
            picture: token.claims.picture,
            locale: token.claims.locale,
        }
    }
}

impl<'a> From<&'a OpenIdCredential> for OpenIdCredentialKey<'a> {
    fn from(credential: &'a OpenIdCredential) -> Self {
        Self {
            sub: &credential.sub,
            iss: &credential.iss,
        }
    }
}

impl OpenIdProvider {
    pub fn jwks_url(&self) -> &'static str {
        match self {
            Self::Google => "https://www.googleapis.com/oauth2/v3/certs",
        }
    }

    pub fn issuers(&self) -> &[&'static str] {
        match self {
            OpenIdProvider::Google => &["https://accounts.google.com", "accounts.google.com"],
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
        }
    }
}

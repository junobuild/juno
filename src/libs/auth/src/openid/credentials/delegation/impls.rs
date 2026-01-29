use crate::openid::credentials::delegation::types::interface::{
    OpenIdCredential, OpenIdCredentialKey,
};
use crate::openid::credentials::delegation::types::provider::OpenIdDelegationProvider;
use crate::openid::jwt::types::token::Claims;
use crate::openid::types::provider::OpenIdProvider;
use jsonwebtoken::TokenData;

impl From<TokenData<Claims>> for OpenIdCredential {
    fn from(token: TokenData<Claims>) -> Self {
        Self {
            sub: token.claims.sub,
            iss: token.claims.iss,
            email: token.claims.email,
            name: token.claims.name,
            given_name: token.claims.given_name,
            family_name: token.claims.family_name,
            preferred_username: token.claims.preferred_username,
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

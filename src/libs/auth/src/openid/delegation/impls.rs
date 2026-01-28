use crate::openid::delegation::types::provider::OpenIdDelegationProvider;
use crate::openid::types::provider::OpenIdProvider;

impl TryFrom<&OpenIdProvider> for OpenIdDelegationProvider {
    type Error = String;

    fn try_from(provider: &OpenIdProvider) -> Result<Self, Self::Error> {
        match provider {
            OpenIdProvider::Google => Ok(OpenIdDelegationProvider::Google),
            OpenIdProvider::GitHubAuth => Ok(OpenIdDelegationProvider::GitHub),
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

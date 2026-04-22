use crate::openid::credentials::delegation::types::interface::{
    OpenIdDelegationCredential, OpenIdDelegationCredentialKey,
};
use crate::openid::credentials::delegation::types::token::DelegationClaims;
use crate::openid::jwt::types::token::JwtClaims;
use jsonwebtoken::TokenData;

impl From<TokenData<DelegationClaims>> for OpenIdDelegationCredential {
    fn from(token: TokenData<DelegationClaims>) -> Self {
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

impl<'a> From<&'a OpenIdDelegationCredential> for OpenIdDelegationCredentialKey<'a> {
    fn from(credential: &'a OpenIdDelegationCredential) -> Self {
        Self {
            sub: &credential.sub,
            iss: &credential.iss,
        }
    }
}

impl JwtClaims for DelegationClaims {
    fn iat(&self) -> Option<u64> {
        self.iat
    }

    fn nonce(&self) -> Option<&str> {
        self.nonce.as_deref()
    }
}

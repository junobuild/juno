use crate::openid::credentials::delegation::types::interface::{
    OpenIdDelegationCredential, OpenIdDelegationCredentialKey,
};
use crate::openid::jwt::types::token::Claims;
use jsonwebtoken::TokenData;

impl From<TokenData<Claims>> for OpenIdDelegationCredential {
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

impl<'a> From<&'a OpenIdDelegationCredential> for OpenIdDelegationCredentialKey<'a> {
    fn from(credential: &'a OpenIdDelegationCredential) -> Self {
        Self {
            sub: &credential.sub,
            iss: &credential.iss,
        }
    }
}

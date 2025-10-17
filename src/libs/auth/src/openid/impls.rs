use crate::openid::jwt::types::Claims;
use crate::openid::types::{OpenIdCredential, OpenIdCredentialKey};
use jsonwebtoken::TokenData;

impl From<TokenData<Claims>> for OpenIdCredential {
    fn from(token: TokenData<Claims>) -> Self {
        Self {
            sub: token.claims.sub,
            iss: token.claims.iss,
            name: token.claims.name,
            email: token.claims.email,
            picture: token.claims.picture,
        }
    }
}

impl From<OpenIdCredential> for OpenIdCredentialKey {
    fn from(credential: OpenIdCredential) -> Self {
        Self {
            sub: credential.sub,
            iss: credential.iss,
        }
    }
}

use crate::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use crate::openid::credentials::automation::types::token::AutomationClaims;
use crate::openid::jwt::types::token::JwtClaims;
use jsonwebtoken::TokenData;

impl From<TokenData<AutomationClaims>> for OpenIdAutomationCredential {
    fn from(token: TokenData<AutomationClaims>) -> Self {
        Self {
            sub: token.claims.sub,
            iss: token.claims.iss,
            jti: token.claims.jti,
            repository: token.claims.repository,
            repository_owner: token.claims.repository_owner,
            r#ref: token.claims.r#ref,
            run_id: token.claims.run_id,
            run_number: token.claims.run_number,
            run_attempt: token.claims.run_attempt,
        }
    }
}

impl JwtClaims for AutomationClaims {
    fn iat(&self) -> Option<u64> {
        self.iat
    }
}

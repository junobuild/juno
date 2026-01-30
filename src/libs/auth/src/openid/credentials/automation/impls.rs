use crate::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use crate::openid::credentials::automation::types::token::AutomationClaims;
use crate::openid::jwt::types::token::JwtClaims;
use jsonwebtoken::TokenData;

// TODO: implement fields in AutomationClaims
impl From<TokenData<AutomationClaims>> for OpenIdAutomationCredential {
    fn from(token: TokenData<AutomationClaims>) -> Self {
        Self {
            sub: token.claims.sub,
            iss: token.claims.iss,
            jti: None,
            repository: None,
            repository_owner: None,
            r#ref: None,
            run_id: None,
            run_number: None,
            run_attempt: None,
        }
    }
}

impl JwtClaims for AutomationClaims {
    fn iat(&self) -> Option<u64> {
        self.iat
    }
}

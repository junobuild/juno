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
            sha: token.claims.sha,
            actor: token.claims.actor,
            workflow: token.claims.workflow,
            event_name: token.claims.event_name,
        }
    }
}

impl JwtClaims for AutomationClaims {
    fn iat(&self) -> Option<u64> {
        self.iat
    }

    // We use the audience to match the caller's principal + salt because GitHub does not allow customizing
    // other JWT fields, making audience our only option for binding the JWT to a specific principal.
    fn nonce(&self) -> Option<&str> {
        Some(&self.aud)
    }
}

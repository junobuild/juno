use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use crate::automation::token::types::state::AutomationTokenKey;

impl AutomationTokenKey {
    pub fn create(
        provider: &OpenIdAutomationProvider,
        jti: &String,
    ) -> Self {
        Self {
            provider: *provider,
            jti: jti.clone(),
        }
    }
    
    pub fn to_key(&self) -> String {
        format!(
            "{}#{}",
            self.provider.to_string(),
            self.jti
        )
    }
}
use crate::automation::token::types::state::{AutomationTokenData, AutomationTokenKey};
use crate::{Doc, SetDoc};
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_utils::encode_doc_data;

impl AutomationTokenKey {
    pub fn create(provider: &OpenIdAutomationProvider, jti: &String) -> Self {
        Self {
            provider: provider.clone(),
            jti: jti.clone(),
        }
    }

    pub fn to_key(&self) -> String {
        format!("{}#{}", self.provider.to_string(), self.jti)
    }
}

impl AutomationTokenData {
    pub fn prepare_set_doc(
        token_data: &AutomationTokenData,
        current_doc: &Option<Doc>,
    ) -> Result<SetDoc, String> {
        let data = encode_doc_data(token_data)?;

        let set_doc = SetDoc {
            data,
            description: None,
            version: current_doc.as_ref().and_then(|d| d.version),
        };

        Ok(set_doc)
    }
}

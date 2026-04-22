use crate::automation::workflow::types::state::{AutomationWorkflowData, AutomationWorkflowKey};
use crate::{Doc, SetDoc};
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_utils::encode_doc_data;

impl AutomationWorkflowKey {
    pub fn create(provider: &OpenIdAutomationProvider, repository: &str, run_id: &str) -> Self {
        Self {
            provider: provider.clone(),
            repository: repository.to_owned(),
            run_id: run_id.to_owned(),
        }
    }

    pub fn to_key(&self) -> String {
        format!("{}#{}#{}", self.provider, self.repository, self.run_id)
    }
}

impl AutomationWorkflowData {
    pub fn prepare_set_doc(
        workflow_data: &AutomationWorkflowData,
        current_doc: &Option<Doc>,
    ) -> Result<SetDoc, String> {
        let data = encode_doc_data(workflow_data)?;

        let set_doc = SetDoc {
            data,
            description: None,
            version: current_doc.as_ref().and_then(|d| d.version),
        };

        Ok(set_doc)
    }
}

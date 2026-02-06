use crate::automation::workflow::types::state::AutomationWorkflowKey;
use crate::errors::automation::{
    JUNO_AUTOMATION_WORKFLOW_ERROR_MISSING_REPOSITORY,
    JUNO_AUTOMATION_WORKFLOW_ERROR_MISSING_RUN_ID,
};
use junobuild_auth::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;

pub fn build_automation_workflow_key(
    provider: &OpenIdAutomationProvider,
    credential: &OpenIdAutomationCredential,
) -> Result<AutomationWorkflowKey, String> {
    let repository = if let Some(repository) = &credential.repository {
        repository
    } else {
        return Err(JUNO_AUTOMATION_WORKFLOW_ERROR_MISSING_REPOSITORY.to_string());
    };

    let run_id = if let Some(run_id) = &credential.run_id {
        run_id
    } else {
        return Err(JUNO_AUTOMATION_WORKFLOW_ERROR_MISSING_RUN_ID.to_string());
    };

    let automation_workflow_key = AutomationWorkflowKey::create(provider, repository, run_id);

    Ok(automation_workflow_key)
}

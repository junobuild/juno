use crate::automation::workflow::types::state::AutomationWorkflowData;
use crate::automation::workflow::utils::build_automation_workflow_key;
use crate::db::internal::unsafe_get_doc;
use crate::db::store::internal_set_doc_store;
use crate::db::types::store::AssertSetDocOptions;
use crate::rules::store::get_rule_db;
use junobuild_auth::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_collections::constants::db::COLLECTION_AUTOMATION_WORKFLOW_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::ic::api::id;

pub fn save_workflow_metadata(
    provider: &OpenIdAutomationProvider,
    credential: &OpenIdAutomationCredential,
) -> Result<(), String> {
    let automation_workflow_key = build_automation_workflow_key(provider, credential)?.to_key();

    let automation_workflow_collection = COLLECTION_AUTOMATION_WORKFLOW_KEY.to_string();

    let rule = get_rule_db(&automation_workflow_collection)
        .ok_or_else(|| msg_db_collection_not_found(&automation_workflow_collection))?;

    let current_automation_workflow = unsafe_get_doc(
        &automation_workflow_collection.to_string(),
        &automation_workflow_key,
        &rule,
    )?;

    // Create or update metadata. Since we are "only" saving the latest information, we always
    // update the fields.
    let automation_workflow_data: AutomationWorkflowData = AutomationWorkflowData {
        run_number: credential.run_number.clone(),
        run_attempt: credential.run_attempt.clone(),
        r#ref: credential.r#ref.clone(),
        sha: credential.sha.clone(),
        actor: credential.actor.clone(),
        workflow: credential.workflow.clone(),
        event_name: credential.event_name.clone(),
    };

    let automation_workflow_data = AutomationWorkflowData::prepare_set_doc(
        &automation_workflow_data,
        &current_automation_workflow,
    )?;

    let assert_options = AssertSetDocOptions {
        // We disable the assertion for the rate because it has been asserted
        // before when saving the jti.
        with_assert_rate: false,
    };

    internal_set_doc_store(
        id(),
        automation_workflow_collection,
        automation_workflow_key,
        automation_workflow_data,
        &assert_options,
    )?;

    Ok(())
}

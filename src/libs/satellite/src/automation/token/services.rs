use crate::automation::token::types::state::{AutomationTokenData, AutomationTokenKey};
use crate::db::internal::unsafe_get_doc;
use crate::db::store::internal_set_doc_store;
use crate::db::types::store::AssertSetDocOptions;
use crate::errors::automation::{
    JUNO_AUTOMATION_TOKEN_ERROR_MISSING_JTI, JUNO_AUTOMATION_TOKEN_ERROR_TOKEN_REUSED,
};
use crate::rules::store::get_rule_db;
use junobuild_auth::automation::types::PreparedAutomation;
use junobuild_auth::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_collections::constants::db::COLLECTION_AUTOMATION_TOKEN_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::ic::api::id;
use junobuild_utils::DocDataPrincipal;

pub fn save_unique_token_jti(
    prepared_automation: &PreparedAutomation,
    provider: &OpenIdAutomationProvider,
    credential: &OpenIdAutomationCredential,
) -> Result<(), String> {
    let jti = if let Some(jti) = &credential.jti {
        jti
    } else {
        return Err(JUNO_AUTOMATION_TOKEN_ERROR_MISSING_JTI.to_string());
    };

    let automation_token_key = AutomationTokenKey::create(provider, jti).to_key();

    let automation_token_collection = COLLECTION_AUTOMATION_TOKEN_KEY.to_string();

    let rule = get_rule_db(&automation_token_collection)
        .ok_or_else(|| msg_db_collection_not_found(&automation_token_collection))?;

    let current_jti = unsafe_get_doc(
        &automation_token_collection.to_string(),
        &automation_token_key,
        &rule,
    )?;

    // ⚠️ Assertion to prevent replay attack.
    if current_jti.is_some() {
        return Err(JUNO_AUTOMATION_TOKEN_ERROR_TOKEN_REUSED.to_string());
    }

    // Create metadata.
    let automation_token_data: AutomationTokenData = AutomationTokenData {
        controller_id: DocDataPrincipal {
            value: prepared_automation.controller.id,
        },
    };

    let automation_token_data =
        AutomationTokenData::prepare_set_doc(&automation_token_data, &None)?;

    let assert_options = AssertSetDocOptions {
        with_assert_rate: true,
    };

    internal_set_doc_store(
        id(),
        automation_token_collection,
        automation_token_key,
        automation_token_data,
        &assert_options,
    )?;

    Ok(())
}

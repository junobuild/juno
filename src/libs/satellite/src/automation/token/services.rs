use junobuild_auth::openid::credentials::automation::types::interface::OpenIdAutomationCredential;
use junobuild_auth::openid::types::provider::OpenIdAutomationProvider;
use junobuild_collections::constants::db::{COLLECTION_AUTOMATION_TOKEN_KEY, COLLECTION_USER_KEY};
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_utils::decode_doc_data;
use crate::automation::token::types::state::AutomationTokenKey;
use crate::db::internal::unsafe_get_doc;
use crate::rules::store::get_rule_db;

pub fn save_token_jti(provider: &OpenIdAutomationProvider,
                      credential: &OpenIdAutomationCredential,) -> Result<(), String> {
    let jti = credential.jti.ok_or("No...")?;

    let user_usage_key = AutomationTokenKey::create(provider, &jti).to_key();

    let token_collection = COLLECTION_AUTOMATION_TOKEN_KEY.to_string();

    let rule = get_rule_db(&token_collection)
        .ok_or_else(|| msg_db_collection_not_found(&token_collection))?;

    let current_jti = unsafe_get_doc(&token_collection.to_string(), &user_usage_key, &rule)?;

    if current_jti.is_some() {
        return Err("No no no....".to_string());
    }

    // TODO: shall we save an entity data?
    // TODO: save

    Ok(())
}
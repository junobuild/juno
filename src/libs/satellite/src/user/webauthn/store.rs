use crate::rules::store::get_rule_db;
use junobuild_collections::constants::db::COLLECTION_USER_WEBAUTHN_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::types::state::UserId;

pub fn delete_user_webauthn(user_id: &UserId) -> Result<(), String> {
    let user_webauthn_collection = COLLECTION_USER_WEBAUTHN_KEY.to_string();

    let rule = get_rule_db(&user_webauthn_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_webauthn_collection))?;

    // TODO:

    Ok(())
}

use crate::db::runtime::increment_and_assert_rate;
use crate::errors::auth::JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED;
use crate::rules::store::get_rule_db;
use candid::Principal;
use junobuild_auth::state::types::config::AuthenticationConfig;
use junobuild_collections::constants::db::COLLECTION_USER_KEY;
use junobuild_collections::msg::msg_db_collection_not_found;
use junobuild_shared::controllers::controller_can_write;
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_equal;

pub fn assert_caller_is_allowed(
    caller: Principal,
    controllers: &Controllers,
    config: &Option<AuthenticationConfig>,
) -> Result<(), String> {
    let Some(auth_config) = config else {
        return Ok(());
    };

    let Some(auth_rules) = &auth_config.rules else {
        return Ok(());
    };

    if auth_rules.allowed_callers.is_empty() {
        return Ok(());
    }

    // Admins do not need to be allowed. The permission scheme of the collections rules their access.
    // It could also lead to some weird effects if admins were disallowed as soon as a set of users is allowed.
    if controller_can_write(caller, controllers) {
        return Ok(());
    }

    if auth_rules
        .allowed_callers
        .iter()
        .any(|allowed_caller| principal_equal(caller, *allowed_caller))
    {
        return Ok(());
    }

    Err(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED.to_string())
}

pub fn increment_and_assert_user_rate() -> Result<(), String> {
    let user_collection = COLLECTION_USER_KEY.to_string();

    let rule = get_rule_db(&user_collection)
        .ok_or_else(|| msg_db_collection_not_found(&user_collection))?;

    increment_and_assert_rate(&user_collection, &rule.rate_config)
}

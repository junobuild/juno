use crate::auth::types::config::AuthenticationConfig;
use crate::errors::auth::JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED;
use candid::Principal;
use junobuild_shared::controllers::controller_can_write;
use junobuild_shared::types::state::Controllers;
use junobuild_shared::utils::principal_equal;

pub fn assert_caller_is_allowed(
    caller: Principal,
    controllers: &Controllers,
    config: &Option<AuthenticationConfig>,
) -> Result<(), String> {
    if config.is_none() {
        return Ok(());
    }

    let auth_config = config.as_ref().unwrap();

    if auth_config.rules.is_none() {
        return Ok(());
    }

    let auth_rules = auth_config.rules.as_ref().unwrap();

    if auth_rules.allowed_callers.is_empty() {
        return Ok(());
    }

    // Admins do not need to be allowed. The permission scheme of the collections rules their access.
    // It could also lead to some weird effects if admins were disallowed as soon as a set of users is allowed.
    if controller_can_write(caller, controllers) {
        return Ok(());
    }

    if !auth_rules
        .allowed_callers
        .iter()
        .any(|user| principal_equal(caller, *user))
    {
        return Err(JUNO_AUTH_ERROR_CALLER_NOT_ALLOWED.to_string());
    }

    Ok(())
}

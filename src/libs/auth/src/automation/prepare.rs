use crate::automation::types::{
    PrepareAutomationError, PrepareAutomationResult, PreparedAutomation,
    PreparedControllerAutomation,
};
use crate::automation::utils::duration::build_expiration;
use crate::automation::utils::scope::build_scope;
use crate::openid::types::provider::OpenIdAutomationProvider;
use crate::strategies::{AuthAutomationStrategy, AuthHeapStrategy};
use junobuild_shared::segments::controllers::{
    assert_controllers, assert_max_number_of_controllers,
};
use junobuild_shared::types::state::ControllerId;

pub fn openid_prepare_automation(
    controller_id: &ControllerId,
    provider: &OpenIdAutomationProvider,
    auth_heap: &impl AuthHeapStrategy,
    auth_automation: &impl AuthAutomationStrategy,
) -> PrepareAutomationResult {
    let existing_controllers = auth_automation.get_controllers();

    if existing_controllers.contains_key(controller_id) {
        return Err(PrepareAutomationError::ControllerAlreadyExists);
    }

    let submitted_controllers: [ControllerId; 1] = [controller_id.clone()];

    assert_controllers(&submitted_controllers)
        .map_err(PrepareAutomationError::InvalidController)?;

    let scope = build_scope(provider, auth_heap);

    assert_max_number_of_controllers(
        &existing_controllers,
        &submitted_controllers,
        &scope.clone().into(),
        None,
    )
    .map_err(PrepareAutomationError::TooManyControllers)?;

    let expires_at = build_expiration(provider, auth_heap);

    let controller: PreparedControllerAutomation = PreparedControllerAutomation {
        id: controller_id.clone(),
        expires_at,
        scope,
    };

    Ok(PreparedAutomation { controller })
}

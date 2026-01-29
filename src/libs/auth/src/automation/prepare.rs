use junobuild_shared::segments::controllers::assert_controllers;
use junobuild_shared::types::state::ControllerId;
use crate::automation::types::{PrepareAutomationError, PrepareAutomationResult, PreparedAutomation, PreparedControllerAutomation};
use crate::automation::utils::duration::build_expiration;
use crate::automation::utils::scope::build_scope;
use crate::openid::types::provider::{OpenIdAutomationProvider};
use crate::strategies::{AuthHeapStrategy};

pub fn openid_prepare_automation(
    controller_id: &ControllerId,
    provider: &OpenIdAutomationProvider,
    auth_heap: &impl AuthHeapStrategy,
) -> PrepareAutomationResult {
    let controllers: [ControllerId; 1] = [controller_id.clone()];

    assert_controllers(&controllers).map_err(PrepareAutomationError::InvalidController)?;

    // TODO: Assert do not exist

    let expires_at = build_expiration(provider, auth_heap);
    
    let scope = build_scope(provider, auth_heap);

    let controller: PreparedControllerAutomation = PreparedControllerAutomation {
        id: controller_id.clone(),
        expires_at,
        scope
    };
    
    Ok(PreparedAutomation { controller })
}
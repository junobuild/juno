use crate::automation::types::AutomationScope;
use crate::openid::types::provider::{OpenIdAutomationProvider};
use crate::state::get_automation;
use crate::strategies::AuthHeapStrategy;

// We default to AutomationScope::Write because practically that's what most developers use.
// i.e. most developers expect their GitHub Actions build to take effect
pub fn build_scope(
    provider: &OpenIdAutomationProvider,
    auth_heap: &impl AuthHeapStrategy,
) -> AutomationScope {
    get_automation(auth_heap)
        .as_ref()
        .and_then(|automation| automation.openid.as_ref())
        .and_then(|openid| openid.providers.get(provider))
        .and_then(|openid| openid.controller.as_ref())
        .and_then(|controller| controller.scope.clone())
        .unwrap_or(AutomationScope::Write)
}
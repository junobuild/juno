use crate::delegation::types::DelegationTargets;
use crate::state::get_config;
use crate::strategies::AuthHeapStrategy;
use junobuild_shared::ic::api::id;

// By default, and for security reasons, we restrict delegation to the authentication module
// that created it. Developers can opt out (allow any targets) or define their own
// restrictions in their configuration.
// See https://internetcomputer.org/docs/current/references/ic-interface-spec#authentication
pub fn delegation_targets(auth_heap: &impl AuthHeapStrategy) -> Option<DelegationTargets> {
    get_config(auth_heap)
        .as_ref()
        .and_then(|config| config.openid.clone())
        .and_then(|openid| openid.delegation)
        .map_or(Some(Vec::from([id()])), |delegation| delegation.targets)
}

use crate::state::get_config;
use crate::strategies::AuthHeapStrategy;
use candid::Principal;
use junobuild_shared::env::OBSERVATORY;

pub fn target_observatory_id(auth_heap: &impl AuthHeapStrategy) -> Result<Principal, String> {
    let observatory_id = get_config(auth_heap).as_ref().and_then(|config| {
        config
            .openid
            .as_ref()
            .and_then(|openid| openid.observatory_id)
    });

    let target =
        observatory_id.unwrap_or(Principal::from_text(OBSERVATORY).map_err(|e| e.to_string())?);

    Ok(target)
}

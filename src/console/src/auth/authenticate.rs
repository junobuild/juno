use crate::auth::store::get_config;
use junobuild_auth::delegation::types::{GetDelegationResult, OpenIdGetDelegationArgs};
use crate::auth::delegation;

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResult, String> {
    let config = get_config().ok_or(JUNO_AUTH_ERROR_NOT_CONFIGURED.to_string())?;
    let openid = config
        .openid
        .ok_or(JUNO_AUTH_ERROR_OPENID_DISABLED.to_string())?;

    let result = delegation::openid_get_delegation(args, &openid.providers);

    Ok(result)
}

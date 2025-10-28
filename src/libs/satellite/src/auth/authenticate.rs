use crate::auth::assert::increment_and_assert_user_rate;
use crate::auth::delegation;
use crate::auth::delegation::openid_prepare_delegation;
use crate::auth::register::register_user;
use crate::auth::store::get_config;
use crate::types::interface::{AuthenticateUserError, AuthenticateUserResult, AuthenticatedUser};
use junobuild_auth::delegation::types::{
    GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
};

pub async fn openid_authenticate_user(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<AuthenticateUserResult, String> {
    // TODO: error labels
    let config = get_config().ok_or("No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or("Authentication with OpenId disabled.")?;

    // We assert early on to avoid generating a delegation which won't be used
    // in case the user cannot be created. We also want to prevent creating delegations
    // while the rate limiter is reached.
    increment_and_assert_user_rate()?;

    let prepared_delegation = openid_prepare_delegation(args, &openid.providers).await;

    let result = match prepared_delegation {
        Ok((delegation, credential)) => {
            let key = delegation.user_key;

            register_user(&key, &credential)
                .map(|doc| AuthenticatedUser {
                    public_key: key,
                    doc,
                })
                .map_err(AuthenticateUserError::RegisterUser)
        }
        Err(err) => Err(AuthenticateUserError::PrepareDelegation(err)),
    };

    Ok(result)
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResult, String> {
    // TODO: error labels
    let config = get_config().ok_or("No authentication configuration found.")?;
    let openid = config
        .openid
        .ok_or("Authentication with OpenId disabled.")?;

    let result = delegation::openid_get_delegation(args, &openid.providers);

    Ok(result)
}

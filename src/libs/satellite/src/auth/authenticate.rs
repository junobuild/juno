use crate::auth::assert::increment_and_assert_user_rate;
use crate::auth::delegation;
use crate::auth::register::register_user;
use crate::auth::strategy_impls::AuthHeap;
use crate::types::interface::{AuthenticateUserError, AuthenticateUserResult, AuthenticatedUser};
use junobuild_auth::delegation::types::{
    GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
};
use junobuild_auth::state::get_providers;

pub async fn openid_authenticate_user(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<AuthenticateUserResult, String> {
    let providers = get_providers(&AuthHeap)?;

    // We assert early on to avoid generating a delegation which won't be used
    // in case the user cannot be created. We also want to prevent creating delegations
    // while the rate limiter is reached.
    increment_and_assert_user_rate()?;

    let prepared_delegation = delegation::openid_prepare_delegation(args, &providers).await;

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
    let providers = get_providers(&AuthHeap)?;

    let result = delegation::openid_get_delegation(args, &providers);

    Ok(result)
}

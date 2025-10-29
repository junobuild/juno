use crate::auth::delegation;
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

    // TODO: rate limiter

    let prepared_delegation = delegation::openid_prepare_delegation(args, &providers).await;

    let result = match prepared_delegation {
        Ok((delegation, credential)) => {
            let key = delegation.user_key;

            // TODO: register user

            Ok(AuthenticatedUser { public_key: key })
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

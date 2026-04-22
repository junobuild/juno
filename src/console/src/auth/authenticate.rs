use crate::auth::delegation;
use crate::auth::register::register_account;
use crate::auth::strategy_impls::AuthHeap;
use crate::rates::increment_mission_controls_rate;
use crate::types::interface::{Authentication, AuthenticationError, AuthenticationResult};
use junobuild_auth::delegation::types::{
    GetDelegationResult, OpenIdGetDelegationArgs, OpenIdPrepareDelegationArgs,
};
use junobuild_auth::state::get_auth_providers;

pub async fn openid_authenticate(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<AuthenticationResult, String> {
    let providers = get_auth_providers(&AuthHeap)?;

    // Guard too many requests
    increment_mission_controls_rate()?;

    let prepared_delegation = delegation::openid_prepare_delegation(args, &providers).await;

    let result = match prepared_delegation {
        Ok((delegation, provider, credential)) => {
            let key = &delegation.user_key;

            register_account(key, &provider, &credential)
                .await
                .map(|account| Authentication {
                    delegation,
                    account,
                })
                .map_err(AuthenticationError::RegisterUser)
        }
        Err(err) => Err(AuthenticationError::PrepareDelegation(err)),
    };

    Ok(result)
}

pub fn openid_get_delegation(
    args: &OpenIdGetDelegationArgs,
) -> Result<GetDelegationResult, String> {
    let providers = get_auth_providers(&AuthHeap)?;

    let result = delegation::openid_get_delegation(args, &providers);

    Ok(result)
}

use crate::auth::delegation::openid_prepare_delegation;
use crate::auth::register::register_user;
use crate::types::interface::{AuthenticateUserError, AuthenticateUserResult, AuthenticatedUser};
use junobuild_auth::delegation::types::OpenIdPrepareDelegationArgs;

pub async fn openid_authenticate_user(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<AuthenticateUserResult, String> {
    // TODO: rate tokens assertions

    let prepared_delegation = openid_prepare_delegation(args).await?;

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

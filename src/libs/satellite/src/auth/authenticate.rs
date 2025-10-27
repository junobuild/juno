use crate::auth::delegation::openid_prepare_delegation;
use crate::auth::register::register_user;
use junobuild_auth::delegation::types::{OpenIdPrepareDelegationArgs, PrepareDelegationResult};

pub async fn openid_authenticate_user(
    args: &OpenIdPrepareDelegationArgs,
) -> Result<PrepareDelegationResult, String> {
    let result = openid_prepare_delegation(args).await?;

    match result {
        Ok((delegation, credential)) => {
            // TODO: return user and popup error
            let _todo = register_user(&delegation.0, &credential);

            Ok(Ok(delegation))
        }
        Err(err) => Ok(Err(err)),
    }
}

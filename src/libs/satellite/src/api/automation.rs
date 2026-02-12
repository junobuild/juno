use crate::automation::authenticate::openid_authenticate_automation;
use crate::automation::types::{AuthenticateAutomationArgs, AuthenticateAutomationResult};
use junobuild_shared::ic::UnwrapOrTrap;

pub async fn authenticate_automation(
    args: AuthenticateAutomationArgs,
) -> AuthenticateAutomationResult {
    match args {
        AuthenticateAutomationArgs::OpenId(args) => {
            openid_authenticate_automation(&args).await.unwrap_or_trap()
        }
    }
}

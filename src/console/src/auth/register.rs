use crate::factory::mission_control::init_user_mission_control;
use crate::types::state::{MissionControl, Provider};
use candid::Principal;
use junobuild_auth::delegation::types::UserKey;
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_shared::ic::api::id;
use crate::store::stable::get_mission_control;

pub async fn register_mission_control(
    public_key: &UserKey,
    credential: &OpenIdCredential,
) -> Result<MissionControl, String> {
    let console = id();
    let user_id = Principal::self_authenticating(public_key);

    let current_mission_control = get_mission_control(&user_id)?;

    let existing_provider_data: Option<&OpenIdData> = match &current_mission_control {
        None => None, // A new user
        Some(mission_control) => match mission_control.provider.as_ref() {
            Some(Provider::Google(provider_data)) => Some(provider_data),
            _ => return Err(JUNO_DATASTORE_ERROR_USER_PROVIDER_GOOGLE_INVALID_DATA.to_string()),
        },
    };

    // If the credential data are unchanged and the mission control already exists, we can return it
    // without any updates.
    if let Some(current_mission_control) =
        &current_mission_control
    {
        if let Some(existing_provider) = current_mission_control.provider.as_ref() {
            let new_provider_data = OpenIdData::from(credential);

            if *existing_provider_data == new_provider_data {
                return Ok(current_user.clone());
            }
        }
    }

    // TODO: init mission control with jwt info

    // TODO: without rate checks
    init_user_mission_control(&console, &user_id).await
}

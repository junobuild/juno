use crate::factory::mission_control::init_user_mission_control_with_provider;
use crate::store::stable::{get_mission_control, update_provider};
use crate::types::state::{MissionControl, OpenIdData, Provider};
use candid::Principal;
use junobuild_auth::delegation::types::UserKey;
use junobuild_auth::openid::types::interface::OpenIdCredential;

pub async fn register_mission_control(
    public_key: &UserKey,
    credential: &OpenIdCredential,
) -> Result<MissionControl, String> {
    let user_id = Principal::self_authenticating(public_key);

    let current_mission_control = get_mission_control(&user_id)?;

    let existing_provider_data: Option<&OpenIdData> = match &current_mission_control {
        None => None, // A new user
        Some(mission_control) => match mission_control.provider.as_ref() {
            Some(Provider::Google(provider_data)) => Some(provider_data),
            _ => return Err("Unsupported provider data for registration.".to_string()),
        },
    };

    // If the credential data are unchanged and the mission control already exists, we can return it
    // without any updates.
    if let (Some(existing_provider_data), Some(current_mission_control)) =
        (existing_provider_data, current_mission_control.as_ref())
    {
        let new_provider_data = OpenIdData::from(credential);

        if *existing_provider_data == new_provider_data {
            return Ok(current_mission_control.clone());
        }
    }

    // Merge or define new provider data.
    let provider_data = if let Some(existing_provider_data) = existing_provider_data {
        OpenIdData::merge(existing_provider_data, credential)
    } else {
        OpenIdData::from(credential)
    };

    let provider = Provider::Google(provider_data);

    // If the mission control exists, we update the latest provider
    // data we got from the credential.
    if let Some(_) = current_mission_control.as_ref() {
        let updated_mission_control = update_provider(&user_id, &provider)?;

        return Ok(updated_mission_control.clone());
    }

    init_user_mission_control_with_provider(&user_id, &provider).await
}

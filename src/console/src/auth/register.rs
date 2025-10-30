use crate::factory::mission_control::init_user_mission_control_with_provider;
use crate::store::stable::{get_mission_control, update_provider};
use crate::types::state::OpenId;
use crate::types::state::{MissionControl, OpenIdData, Provider};
use candid::Principal;
use junobuild_auth::delegation::types::UserKey;
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_auth::openid::types::provider::OpenIdProvider;

pub async fn register_mission_control(
    public_key: &UserKey,
    credential: &OpenIdCredential,
) -> Result<MissionControl, String> {
    let user_id = Principal::self_authenticating(public_key);

    let current_mission_control = get_mission_control(&user_id)?;

    let existing_provider_data: Option<&OpenIdData> = match &current_mission_control {
        None => None, // A new user
        Some(mission_control) => match mission_control.provider.as_ref() {
            Some(Provider::OpenId(OpenId { data, .. })) => Some(data),
            _ => return Err("Unsupported provider data for registration.".to_string()),
        },
    };

    let new_provider_data = OpenIdData::from(credential);

    // If credentials are unchanged and the mission control already exists, return it.
    if let (Some(existing_provider_data), Some(current_mission_control)) =
        (existing_provider_data, current_mission_control.as_ref())
    {
        if *existing_provider_data == new_provider_data {
            return Ok(current_mission_control.clone());
        }
    }

    // Merge with existing provider data or create new provider data.
    let provider_data = if let Some(existing_provider_data) = existing_provider_data {
        OpenIdData::merge(existing_provider_data, credential)
    } else {
        new_provider_data
    };

    let provider = Provider::OpenId(OpenId {
        provider: OpenIdProvider::Google,
        data: provider_data,
    });

    // If mission control exists, update provider data and return it.
    if current_mission_control.is_some() {
        let updated_mission_control = update_provider(&user_id, &provider)?;

        return Ok(updated_mission_control);
    }

    init_user_mission_control_with_provider(&user_id, &provider).await
}

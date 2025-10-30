use crate::factory::mission_control::init_user_mission_control;
use crate::types::state::MissionControl;
use candid::Principal;
use junobuild_auth::delegation::types::UserKey;
use junobuild_auth::openid::types::interface::OpenIdCredential;
use junobuild_shared::ic::api::id;

pub async fn register_mission_control(
    public_key: &UserKey,
    credential: &OpenIdCredential,
) -> Result<MissionControl, String> {
    let console = id();
    let user_id = Principal::self_authenticating(public_key);

    // TODO: init mission control with jwt info

    // TODO: without rate checks
    init_user_mission_control(&console, &user_id).await
}

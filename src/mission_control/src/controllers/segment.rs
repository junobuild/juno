use candid::Principal;
use ic_cdk::call::Call;
use junobuild_shared::ic::DecodeCandid;
use junobuild_shared::mgmt::ic::update_canister_controllers;
use junobuild_shared::segments::access_keys::{
    assert_access_key_expiration, assert_controllers, filter_admin_access_keys, into_access_key_ids,
};
use junobuild_shared::types::interface::{
    DeleteControllersArgs, SetController, SetControllersArgs,
};
use junobuild_shared::types::state::{AccessKeyId, AccessKeys};

pub async fn set_segment_controllers(
    segment_id: &Principal,
    controllers: &[AccessKeyId],
    controller: &SetController,
) -> Result<(), String> {
    assert_controllers(controllers)?;

    assert_access_key_expiration(controller)?;

    let satellite_admin_controllers = set_controllers(segment_id, controllers, controller).await?;

    // We update the IC controllers because it is possible that an existing controller was updated.
    // e.g. existing controller was Read-Write and becomes Administrator.
    update_segment_controllers_settings(segment_id, &satellite_admin_controllers).await
}

pub async fn delete_segment_controllers(
    segment_id: &Principal,
    controllers: &[AccessKeyId],
) -> Result<(), String> {
    let satellite_admin_controllers = delete_controllers(segment_id, controllers).await?;

    // For simplicity reason we update the list of controllers even if we removed only Write scoped controllers.
    update_segment_controllers_settings(segment_id, &satellite_admin_controllers).await
}

async fn set_controllers(
    segment_id: &Principal,
    controllers: &[AccessKeyId],
    controller: &SetController,
) -> Result<Vec<AccessKeyId>, String> {
    let args = SetControllersArgs {
        controllers: controllers.to_owned(),
        controller: controller.clone(),
    };

    let controllers = Call::unbounded_wait(*segment_id, "set_controllers")
        .with_arg(args)
        .await
        .decode_candid::<AccessKeys>()?;

    Ok(into_access_key_ids(&filter_admin_access_keys(&controllers)))
}

async fn delete_controllers(
    segment_id: &Principal,
    controllers: &[AccessKeyId],
) -> Result<Vec<AccessKeyId>, String> {
    let args = DeleteControllersArgs {
        controllers: controllers.to_owned(),
    };

    let controllers = Call::unbounded_wait(*segment_id, "del_controllers")
        .with_arg(args)
        .await
        .decode_candid::<AccessKeys>()?;

    Ok(into_access_key_ids(&filter_admin_access_keys(&controllers)))
}

pub async fn update_segment_controllers_settings(
    segment_id: &Principal,
    controllers: &[AccessKeyId],
) -> Result<(), String> {
    let result = update_canister_controllers(*segment_id, controllers.to_owned()).await;

    match result {
        Err(_) => Err("Failed to update controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}

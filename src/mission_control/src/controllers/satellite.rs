use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::ic::update_canister_controllers;
use shared::types::interface::{ControllersArgs, UserId};

pub async fn add_satellite_controllers(
    satellite_id: &Principal,
    controllers: &[UserId],
) -> Result<(), String> {
    let updated_controllers = add_controllers(satellite_id, controllers).await?;

    update_controllers_settings(satellite_id, &updated_controllers).await
}

pub async fn remove_satellite_controllers(
    satellite_id: &Principal,
    controllers: &[UserId],
) -> Result<(), String> {
    let updated_controllers = remove_controllers(satellite_id, controllers).await?;

    update_controllers_settings(satellite_id, &updated_controllers).await
}

async fn add_controllers(
    satellite_id: &Principal,
    controllers: &[UserId],
) -> Result<Vec<UserId>, String> {
    let args = ControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Vec<UserId>,)> = call(*satellite_id, "add_controllers", (args,)).await;

    match result {
        Err((_, message)) => Err(["Failed to add controllers to satellite.", &message].join(" - ")),
        Ok((result,)) => Ok(result),
    }
}

async fn remove_controllers(
    satellite_id: &Principal,
    controllers: &[UserId],
) -> Result<Vec<UserId>, String> {
    let args = ControllersArgs {
        controllers: controllers.to_owned(),
    };

    let result: CallResult<(Vec<UserId>,)> =
        call(*satellite_id, "remove_controllers", (args,)).await;

    match result {
        Err((_, message)) => {
            Err(["Failed to remove controllers from satellite.", &message].join(" - "))
        }
        Ok((result,)) => Ok(result),
    }
}

async fn update_controllers_settings(
    satellite_id: &Principal,
    controllers: &[UserId],
) -> Result<(), String> {
    let result = update_canister_controllers(*satellite_id, controllers.to_owned()).await;

    match result {
        Err(_) => Err("Failed to update satellite controllers settings.".to_string()),
        Ok(_) => Ok(()),
    }
}

use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use junobuild_shared::env::OBSERVATORY;
use junobuild_shared::types::interface::NotifyArgs;

pub async fn notify_observatory(args: &NotifyArgs) -> Result<(), String> {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    let result: CallResult<((),)> = call(observatory, "notify", (args,)).await;

    match result {
        Err((_, message)) => Err(["Notification to the Observatory failed.", &message].join(" - ")),
        Ok(_) => Ok(()),
    }
}

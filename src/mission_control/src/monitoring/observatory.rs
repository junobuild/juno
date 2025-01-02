use candid::Principal;
use ic_cdk::api::call::CallResult;
use ic_cdk::{call, print, spawn};
use ic_cdk_timers::set_timer;
use junobuild_shared::env::OBSERVATORY;
use junobuild_shared::types::interface::NotifyArgs;
use std::time::Duration;

pub fn defer_notify(args: NotifyArgs) {
    set_timer(Duration::ZERO, || spawn(notify(args)));
}

async fn notify(args: NotifyArgs) {
    notify_observatory(&args).await.unwrap_or_else(|e| {
        // Maybe in the future, we can track the potential transmission of the notification error, but for now, we’ll simply log it.
        print(e)
    })
}

async fn notify_observatory(args: &NotifyArgs) -> Result<(), String> {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    let result: CallResult<((),)> = call(observatory, "notify", (args,)).await;

    match result {
        Err((_, message)) => Err(["Notification to the Observatory failed.", &message].join(" - ")),
        Ok(_) => Ok(()),
    }
}

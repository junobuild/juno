use candid::Principal;
use ic_cdk::call::Call;
use junobuild_shared::env::OBSERVATORY;
use junobuild_shared::ic::DecodeCandid;
use junobuild_shared::types::interface::NotifyArgs;

pub async fn notify_observatory(args: &NotifyArgs) -> Result<(), String> {
    let observatory = Principal::from_text(OBSERVATORY).unwrap();

    let _ = Call::bounded_wait(observatory, "notify")
        .with_arg(args)
        .await
        .decode_candid::<()>()?;

    Ok(())
}

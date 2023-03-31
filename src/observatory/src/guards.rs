use candid::Principal;
use ic_cdk::caller;
use shared::env::CONSOLE;
use shared::utils::principal_equal;

pub fn caller_is_console() -> Result<(), String> {
    let caller = caller();
    let console = Principal::from_text(CONSOLE).unwrap();

    if principal_equal(caller, console) {
        Ok(())
    } else {
        Err("Caller is not the console.".to_string())
    }
}

use crate::functions::execute_sync_function;
use candid::{CandidType, Principal};
use junobuild_macros::JsonData;
use junobuild_shared::ic::UnwrapOrTrap;
use serde::{Deserialize, Serialize};

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct AppHelloWorldArgs {
    value: Principal,
}

// Output must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct AppHelloWorldResult {
    value: Principal,
    text: String,
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::query]
fn app_hello_world(input: AppHelloWorldArgs) -> AppHelloWorldResult {
    execute_sync_function("helloWorld", input).unwrap_or_trap()
}

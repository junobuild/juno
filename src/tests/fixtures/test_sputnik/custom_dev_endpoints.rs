use crate::functions::{execute_sync_function, execute_async_function};
use candid::{CandidType, Principal};
use junobuild_macros::JsonData;
use junobuild_shared::ic::UnwrapOrTrap;
use serde::{Deserialize, Serialize};
use junobuild_utils::IntoJsonData;

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, Clone, JsonData)]
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

// Output must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct AppWelcomeResult {
    caller: Principal,
    value: u64,
}

#[derive(Clone)]
pub struct NoArgs;

impl IntoJsonData for NoArgs {
    fn into_json_data(self) -> Result<Vec<u8>, String> {
        // Used only for compilation purposes. Is never used.
        Ok(vec![])
    }
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::update]
async fn app_welcome() -> AppWelcomeResult {
    execute_async_function::<NoArgs, AppWelcomeResult>("welcome", None).await.unwrap_or_trap()
}
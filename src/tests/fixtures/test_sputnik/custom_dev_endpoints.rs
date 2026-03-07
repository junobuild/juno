#![allow(unused)]

use crate::functions::{execute_sync_function, execute_async_function, types::{NoArgs, NoResult}};
use candid::{CandidType, Principal};
use junobuild_macros::JsonData;
use junobuild_shared::ic::UnwrapOrTrap;
use junobuild_shared::ic::UnwrapOrTrapResult;
use serde::{Deserialize, Serialize};

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
    execute_sync_function("helloWorld", Some(input)).unwrap_or_trap_result()
}

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, Clone, JsonData)]
pub struct AppWelcomeArgs {
    value: String,
}

// Output must be a struct
#[derive(CandidType, Serialize, Deserialize, JsonData)]
pub struct AppWelcomeResult {
    caller: Principal,
    value: u64,
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::update]
async fn app_welcome(args: AppWelcomeArgs) -> AppWelcomeResult {
    execute_async_function("welcome", Some(args)).await.unwrap_or_trap_result()
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::update]
async fn app_welcome_without_args() -> AppWelcomeResult {
    execute_async_function::<NoArgs, AppWelcomeResult>("welcome_without_args", None).await.unwrap_or_trap_result()
}

// Input must be a struct
#[derive(CandidType, Serialize, Deserialize, Clone, JsonData)]
pub struct AppYoloArgs {
    value: String,
}

// We require or use a prefix to avoid clashes?
#[ic_cdk::update]
async fn app_yolo() {
    execute_async_function::<NoArgs, NoResult>("yolo", None).await.unwrap_or_trap();
}
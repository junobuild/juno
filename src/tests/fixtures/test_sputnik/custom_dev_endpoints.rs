use ic_cdk::{update, query, print};
use junobuild_satellite::{
    caller
};
pub use candid::Principal;

#[query]
fn hello() {
    print("hello")
}

#[update]
fn world() -> Principal {
    caller()
}


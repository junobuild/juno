use ic_cdk::{update, query, print};
use junobuild_satellite::{
    caller
};
use candid::Principal;

#[query]
fn hello() {
    print("hello")
}

#[update]
fn world() -> Principal {
    caller()
}


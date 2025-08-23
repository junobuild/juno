#![allow(clippy::disallowed_methods)]

use ic_cdk::update;
use junobuild_macros::{
    on_delete_doc, on_init_random_seed, on_init_sync, on_post_upgrade_sync, on_set_doc,
};
use junobuild_satellite::{error, id, include_satellite, info, random, set_doc_store, warn_with_data, OnDeleteDocContext, OnSetDocContext, SetDoc};
use junobuild_utils::{decode_doc_data, encode_doc_data, DocDataBigInt, DocDataPrincipal};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct MockData {
    hello: DocDataBigInt,
}

#[on_set_doc]
fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
    info("Hello world".to_string())?;

    match context.data.collection.as_str() {
        "test_utils" => {
            let data = decode_doc_data::<MockData>(&context.data.data.after.data)?;

            ic_cdk::print(format!("BigInt decoded: {}", data.hello.value));
            let hello_update = data.hello.value.saturating_add(1);

            let update_data = MockData {
                hello: DocDataBigInt {value: hello_update},
            };

            let doc: SetDoc = SetDoc {
                data: encode_doc_data(&update_data)?,
                description: None,
                version: context.data.data.after.version.clone(),
            };

            let _ = set_doc_store(id(), "test_utils".to_string(), context.data.key, doc)?;
        },
        _ => ()
    }

    Ok(())
}

#[on_delete_doc]
fn on_delete_doc(_context: OnDeleteDocContext) -> Result<(), String> {
    error("Delete Hello world".to_string())?;

    Ok(())
}

#[on_init_sync]
fn on_init_sync() {
    ic_cdk::print("On init sync was executed");
}

#[on_post_upgrade_sync]
fn on_post_upgrade_sync() {
    ic_cdk::print("On post upgrade sync was executed");
}

#[on_init_random_seed]
fn on_init_random_seed() -> Result<(), String> {
    let value = random()?;

    warn_with_data("Random initialized".to_string(), &value)?;

    Ok(())
}

#[update]
fn get_random() -> Result<i32, String> {
    random()
}

include_satellite!();

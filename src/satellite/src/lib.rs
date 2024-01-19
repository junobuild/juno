use ic_cdk::{print, trap};
use junobuild_macros::{on_delete_doc, on_set_doc};
use junobuild_satellite::{include_satellite, OnDeleteDocContext, OnSetDocContext};
use junobuild_utils::decode_doc_data;
use junobuild_utils::serializers::types::{BigInt, Principal};
use serde::{Deserialize, Serialize};

// TODO: remove hooks, only used for test purpose while blockchainless feature is under development

#[derive(Serialize, Deserialize)]
struct Person {
    yolo: bool,
    hello: String,
    value: BigInt,
    user: Principal,
}

#[on_set_doc]
async fn on_set_doc(context: OnSetDocContext) {
    let data: Person =
        decode_doc_data(&context.data.doc.data).unwrap_or_else(|e| trap(&format!("{}", e)));

    print(format!("[on_set_doc] Caller: {}", context.caller.to_text()));

    print(format!(
        "[on_set_doc] Collection: {}",
        context.data.collection
    ));

    print(format!(
        "[on_set_doc] Data: {} {} {}",
        data.hello,
        data.value,
        data.user.value.to_text()
    ));
}

#[on_delete_doc]
fn on_delete_doc(context: OnDeleteDocContext) {
    print(format!("[on_delete_doc] Key: {}", context.data.key));
}

include_satellite!();

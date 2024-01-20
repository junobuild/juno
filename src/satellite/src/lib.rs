use ic_cdk::print;
use junobuild_macros::{on_delete_doc, on_set_doc};
use junobuild_satellite::{
    include_satellite, set_doc_store, OnDeleteDocContext, OnSetDocContext, SetDoc,
};
use junobuild_utils::serializers::types::{BigInt, Principal};
use junobuild_utils::{decode_doc_data, encode_doc_data};
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
async fn on_set_doc(context: OnSetDocContext) -> Result<(), String> {
    let mut data: Person = decode_doc_data(&context.data.doc.data)?;

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

    data.hello = format!("{} checked", data.hello);
    data.value = BigInt {
        value: data.value.value + 1,
    };

    let encode_data = encode_doc_data(&data)?;

    let doc: SetDoc = SetDoc {
        data: encode_data,
        description: context.data.doc.description,
        updated_at: Some(context.data.doc.updated_at),
    };

    set_doc_store(
        context.caller,
        context.data.collection,
        context.data.key,
        doc,
    )?;

    Ok(())
}

#[on_delete_doc]
fn on_delete_doc(context: OnDeleteDocContext) {
    print(format!("[on_delete_doc] Key: {}", context.data.key));
}

include_satellite!();

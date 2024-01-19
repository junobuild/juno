use ic_cdk::{print, trap};
use junobuild_macros::on_set_doc;
use junobuild_satellite::include_satellite;
use junobuild_satellite::Doc;
use junobuild_utils::decode_doc_data;
use junobuild_utils::serializers::types::{BigInt, Principal};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Person {
    yolo: bool,
    hello: String,
    value: BigInt,
    user: Principal,
}

#[on_set_doc]
async fn on_set_doc(doc: Doc) {
    let data: Person = decode_doc_data(&doc.data).unwrap_or_else(|e| trap(&format!("{}", e)));

    print(format!(
        "[on_set_doc] Data: {} {} {}",
        data.hello,
        data.value,
        data.user.value.to_text()
    ));
}

include_satellite!();

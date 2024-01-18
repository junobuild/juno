use ic_cdk::print;
use junobuild_macros::on_set_doc;
use junobuild_satellite::db::types::state::Doc;
use junobuild_satellite::include_satellite;
use junobuild_utils::serializers::types::json::Principal;
use junobuild_utils::serializers::types::BigInt;
use serde::{Deserialize, Serialize};
use serde_json::{from_slice, from_str, Value};

#[derive(Serialize, Deserialize)]
struct Person {
    yolo: bool,
    hello: String,
    value: BigInt,
    user: Principal,
}

#[on_set_doc]
async fn on_set_doc(doc: Doc) {
    print("On set doc called with the function set as extern Rust.");

    match from_slice::<Person>(&doc.data) {
        Ok(data) => print(format!(
            "Str -> JSON OK {} {}",
            data.value,
            data.user.value.to_text()
        )),
        Err(err) => print(format!("Error str -> JSON {}", err)),
    }

    match from_slice::<Value>(&doc.data) {
        Ok(data) => {
            let d = data.get("__bigint__");

            match d {
                Some(d) => print(format!("Str -> JSON OK bigint {}", d)),
                None => print("No JSON bigint"),
            }
        }
        Err(err) => print(format!("Error str -> JSON {}", err)),
    }

    if let Ok(v) = from_slice::<Value>(&doc.data) {
        print(format!("ça marche {}", v["user"]));
    }

    // Some JSON input data as a &str. Maybe this comes from the user.
    let data = r#"
        {
            "name": "John Doe",
            "age": 43,
            "phones": [
                "+44 1234567",
                "+44 2345678"
            ]
        }"#;

    // Parse the string of data into serde_json::Value.
    if let Ok(v) = from_str::<Value>(data) {
        print(format!(
            "Please call {} at the number {}",
            v["name"], v["phones"][0]
        ));
    }
}

include_satellite!();

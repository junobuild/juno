use ic_cdk::export::candid::{candid_method, export_service};
use ic_cdk_macros::{query};

#[candid_method(query)]
#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

// Generate did files

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    export_service!();
    __export_service()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let dir = dir
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("src")
            .join("console");
        write(dir.join("console.did"), export_candid()).expect("Write failed.");
    }
}

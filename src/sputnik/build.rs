use std::env;
use std::fs;
use std::path;

fn main() {
    // Re-run a build if env variable DEV_SCRIPT_PATH changes.
    println!("cargo:rerun-if-env-changed=DEV_SCRIPT_PATH");

    // Re-run a build if env variable DEV_FUNCTIONS_PATH changes.
    println!("cargo:rerun-if-env-changed=DEV_FUNCTIONS_PATH");

    let default_path = "../../resources/index.mjs";
    let script_path = env::var("DEV_SCRIPT_PATH").unwrap_or_else(|_| default_path.to_string());

    println!("cargo:rustc-env=DEV_SCRIPT_PATH={script_path}");

    let source =
        env::var("DEV_FUNCTIONS_PATH").unwrap_or_else(|_| "resources/functions.rs".to_string());

    if path::Path::new(&source).exists() {
        println!("cargo:rerun-if-changed={source}");
        fs::copy(&source, "src/generated.rs").expect("Failed to copy generated.rs");
    } else {
        fs::copy("resources/functions.rs", "src/generated.rs")
            .expect("Failed to copy generated.rs");
    }
}

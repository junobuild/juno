use std::env;

fn main() {
    // Re-run a build if env variable DEV_SCRIPT_PATH changes.
    println!("cargo:rerun-if-env-changed=DEV_SCRIPT_PATH");

    // Re-run a build if env variable DEV_CUSTOM_FUNCTIONS_PATH changes.
    println!("cargo:rerun-if-env-changed=DEV_CUSTOM_FUNCTIONS_PATH");

    let default_path = "../../resources/index.mjs";
    let script_path = env::var("DEV_SCRIPT_PATH").unwrap_or_else(|_| default_path.to_string());

    println!("cargo:rustc-env=DEV_SCRIPT_PATH={script_path}");

    let default_custom_functions_path = "generated.rs";
    let custom_functions_path = env::var("DEV_CUSTOM_FUNCTIONS_PATH")
        .unwrap_or_else(|_| default_custom_functions_path.to_string());

    println!("cargo:rustc-env=DEV_CUSTOM_FUNCTIONS_PATH={custom_functions_path}");
}

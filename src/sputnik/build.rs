use std::env;

fn main() {
    // Re-rerun a build if env variable DEV_SCRIPT_PATH change.
    println!("cargo:rerun-if-env-changed=DEV_SCRIPT_PATH");

    let default_path = "../../resources/index.mjs";
    let script_path = env::var("DEV_SCRIPT_PATH").unwrap_or_else(|_| default_path.to_string());

    println!("cargo:rustc-env=DEV_SCRIPT_PATH={script_path}");
}

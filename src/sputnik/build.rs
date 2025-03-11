use std::env;

fn main() {
    // Always re-rerun a build. Useful if nothing changes but the environment variable did.
    println!("cargo:rerun-if-changed=");

    let default_path = "../../resources/index.mjs";
    let script_path = env::var("DEV_SCRIPT_PATH").unwrap_or_else(|_| default_path.to_string());

    println!("cargo:rustc-env=DEV_SCRIPT_PATH={}", script_path);
}

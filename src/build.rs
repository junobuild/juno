use std::env;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;

fn main() {
    let current_dir = env::current_dir().unwrap();

    let project_root = if current_dir.ends_with("src/libs/satellite") {
        current_dir.clone()
    } else {
        // Replace "src/libs/satellite" with "src/satellite" - we are building the Satellite, not the lib
        let mut modified_path = current_dir.to_str().unwrap().to_string();
        modified_path = modified_path.replace("src/libs/satellite", "src/satellite");
        PathBuf::from(modified_path)
    };

    let cargo_toml = project_root.join("Cargo.toml");

    if !cargo_toml.exists() || !cargo_toml.is_file() {
        panic!("File does not exist: {:?}", cargo_toml);
    }

    let file = File::open(cargo_toml.clone()).unwrap();
    let reader = BufReader::new(file);

    for line in reader.lines() {
        let line = line.unwrap();

        if line.starts_with("version =") {
            let version_full = line.split('"').nth(1).unwrap();
            // Extract only version - no patch
            let version_base = version_full
                .split(|c| c == '.' || c == '-')
                .take(3)
                .collect::<Vec<&str>>()
                .join(".");
            println!("cargo:rustc-env=SATELLITE_VERSION={}", version_base);
            break;
        }
    }
}

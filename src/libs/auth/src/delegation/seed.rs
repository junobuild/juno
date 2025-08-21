use crate::types::core::Salt;
use ic_certification::Hash;
use sha2::{Digest, Sha256};

pub fn calculate_seed(
    anchor_id: &str,
    frontend: &str,
    salt: &Option<Salt>,
) -> Result<Hash, String> {
    let salt =
        salt.ok_or("The salt has not been initialized. A seed cannot be calculated.".to_string())?;

    let mut blob: Vec<u8> = vec![];
    blob.push(salt.len() as u8);
    blob.extend_from_slice(&salt);

    let anchor_number_str = anchor_id;
    let anchor_number_blob = anchor_number_str.bytes();
    blob.push(anchor_number_blob.len() as u8);
    blob.extend(anchor_number_blob);

    blob.push(frontend.len() as u8);
    blob.extend(frontend.bytes());

    let seed = hash_bytes(blob);

    Ok(seed)
}

fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

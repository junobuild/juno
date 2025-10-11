use crate::delegation::types::jwt::OpenIdCredentialKey;
use crate::types::state::Salt;
use ic_certification::Hash;
use sha2::{Digest, Sha256};

pub fn calculate_seed(
    client_id: &str,
    key: &OpenIdCredentialKey,
    salt: &Option<Salt>,
) -> Result<Hash, String> {
    let salt =
        salt.ok_or("The salt has not been initialized. A seed cannot be calculated.".to_string())?;

    let mut blob: Vec<u8> = vec![];
    blob.push(salt.len() as u8);
    blob.extend_from_slice(&salt);

    blob.push(client_id.len() as u8);
    blob.extend(client_id.bytes());

    blob.push(key.iss.len() as u8);
    blob.extend(key.iss.bytes());

    blob.push(key.sub.len() as u8);
    blob.extend(key.sub.bytes());

    // TODO: frontend?

    let seed = hash_bytes(blob);
    Ok(seed)
}

fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

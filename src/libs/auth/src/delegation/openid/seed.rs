use crate::delegation::openid::types::OpenIdCredentialKey;
use crate::state::types::state::Salt;
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

    let seed = hash_bytes(blob);
    Ok(seed)
}

fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::calculate_seed;
    use crate::delegation::openid::types::OpenIdCredentialKey;
    use crate::state::types::state::Salt;
    use ic_certification::Hash;
    use sha2::{Digest, Sha256};

    fn salt(bytes: u8) -> Salt {
        [bytes; 32]
    }

    fn key(iss: &str, sub: &str) -> OpenIdCredentialKey {
        OpenIdCredentialKey {
            iss: iss.to_string(),
            sub: sub.to_string(),
        }
    }

    fn build_blob(client_id: &str, key: &OpenIdCredentialKey, salt: &Salt) -> Vec<u8> {
        let mut blob: Vec<u8> = vec![];

        blob.push(salt.len() as u8);
        blob.extend_from_slice(salt);

        blob.push(client_id.len() as u8);
        blob.extend(client_id.as_bytes());

        blob.push(key.iss.len() as u8);
        blob.extend(key.iss.as_bytes());

        blob.push(key.sub.len() as u8);
        blob.extend(key.sub.as_bytes());

        blob
    }

    fn sha256(bytes: &[u8]) -> Hash {
        let mut h = Sha256::new();
        h.update(bytes);
        h.finalize().into()
    }

    #[test]
    fn deterministic_for_same_inputs() {
        let salt = salt(0x11);
        let key = key("https://accounts.google.com", "abc123");
        let client_id = "client-123";

        let a = calculate_seed(client_id, &key, &Some(salt)).expect("ok");
        let b = calculate_seed(client_id, &key, &Some(salt)).expect("ok");
        assert_eq!(a, b);
    }

    #[test]
    fn matches_manual_blob_hash() {
        let salt = salt(0x42);
        let key = key("https://accounts.google.com", "user-sub-001");
        let client_id = "my-client";

        let expected = sha256(&build_blob(client_id, &key, &salt));
        let got = calculate_seed(client_id, &key, &Some(salt)).expect("ok");

        assert_eq!(
            got, expected,
            "seed must be SHA-256 over the length-prefixed blob"
        );
    }

    #[test]
    fn changes_when_client_id_changes() {
        let salt = salt(0x7A);
        let key = key("https://accounts.google.com", "abc123");

        let a = calculate_seed("client-a", &key, &Some(salt)).unwrap();
        let b = calculate_seed("client-b", &key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_iss_changes() {
        let salt = salt(0x7A);
        let a_key = key("https://accounts.google.com", "abc123");
        let b_key = key("https://issuer.example", "abc123");

        let cid = "client";
        let a = calculate_seed(cid, &a_key, &Some(salt)).unwrap();
        let b = calculate_seed(cid, &b_key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_sub_changes() {
        let salt = salt(0x7A);
        let a_key = key("https://accounts.google.com", "sub-a");
        let b_key = key("https://accounts.google.com", "sub-b");

        let cid = "client";
        let a = calculate_seed(cid, &a_key, &Some(salt)).unwrap();
        let b = calculate_seed(cid, &b_key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_salt_changes() {
        let key = key("https://accounts.google.com", "abc123");
        let cid = "client";

        let a = calculate_seed(cid, &key, &Some(salt(0x00))).unwrap();
        let b = calculate_seed(cid, &key, &Some(salt(0xFF))).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn errors_when_no_salt() {
        let key = key("https://accounts.google.com", "abc123");
        let err = calculate_seed("client", &key, &None).unwrap_err();
        assert!(
            err.contains("The salt has not been initialized"),
            "got: {err}"
        );
    }
}

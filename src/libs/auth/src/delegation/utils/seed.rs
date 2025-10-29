use crate::openid::types::interface::OpenIdCredentialKey;
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
    use crate::openid::types::interface::OpenIdCredentialKey;
    use crate::state::types::state::Salt;
    use ic_certification::Hash;
    use sha2::{Digest, Sha256};

    fn salt(bytes: u8) -> Salt {
        [bytes; 32]
    }

    fn key<'a>(iss: &'a String, sub: &'a String) -> OpenIdCredentialKey<'a> {
        OpenIdCredentialKey { iss, sub }
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
        let iss = "https://accounts.google.com".to_string();
        let sub = "abc123".to_string();
        let key = key(&iss, &sub);
        let client_id = "client-123";

        let a = calculate_seed(client_id, &key, &Some(salt)).expect("ok");
        let b = calculate_seed(client_id, &key, &Some(salt)).expect("ok");
        assert_eq!(a, b);
    }

    #[test]
    fn matches_manual_blob_hash() {
        let salt = salt(0x42);
        let iss = "https://accounts.google.com".to_string();
        let sub = "user-sub-001".to_string();
        let key = key(&iss, &sub);
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
        let iss = "https://accounts.google.com".to_string();
        let sub = "abc123".to_string();
        let key = key(&iss, &sub);

        let a = calculate_seed("client-a", &key, &Some(salt)).unwrap();
        let b = calculate_seed("client-b", &key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_iss_changes() {
        let salt = salt(0x7A);
        let iss_a = "https://accounts.google.com".to_string();
        let iss_b = "https://issuer.example".to_string();
        let sub = "abc123".to_string();

        let a_key = key(&iss_a, &sub);
        let b_key = key(&iss_b, &sub);

        let cid = "client";
        let a = calculate_seed(cid, &a_key, &Some(salt)).unwrap();
        let b = calculate_seed(cid, &b_key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_sub_changes() {
        let salt = salt(0x7A);
        let iss = "https://accounts.google.com".to_string();
        let sub_a = "sub-a".to_string();
        let sub_b = "sub-b".to_string();

        let a_key = key(&iss, &sub_a);
        let b_key = key(&iss, &sub_b);

        let cid = "client";
        let a = calculate_seed(cid, &a_key, &Some(salt)).unwrap();
        let b = calculate_seed(cid, &b_key, &Some(salt)).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn changes_when_salt_changes() {
        let iss = "https://accounts.google.com".to_string();
        let sub = "abc123".to_string();
        let key = key(&iss, &sub);
        let cid = "client";

        let a = calculate_seed(cid, &key, &Some(salt(0x00))).unwrap();
        let b = calculate_seed(cid, &key, &Some(salt(0xFF))).unwrap();
        assert_ne!(a, b);
    }

    #[test]
    fn errors_when_no_salt() {
        let iss = "https://accounts.google.com".to_string();
        let sub = "abc123".to_string();
        let key = key(&iss, &sub);

        let err = calculate_seed("client", &key, &None).unwrap_err();
        assert!(
            err.contains("The salt has not been initialized"),
            "got: {err}"
        );
    }
}

use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine as _;
use junobuild_shared::ic::api::caller;
use sha2::{Digest, Sha256};

pub fn build_nonce(salt: &[u8; 32]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt);
    hasher.update(caller().as_slice());
    let hash: [u8; 32] = hasher.finalize().into();
    URL_SAFE_NO_PAD.encode(hash)
}

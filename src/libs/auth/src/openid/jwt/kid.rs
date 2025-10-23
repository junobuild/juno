use crate::openid::jwt::decode_jwt_header;
use crate::openid::jwt::types::errors::JwtFindKidError;
use candid::Deserialize;
use jsonwebtoken::dangerous;

// TODO: refactor duplicate struct
#[derive(Clone, Deserialize)]
struct UnsafeClaims {
    pub iss: Option<String>,
}

// TODO: refactor decode_jwt_header for perf reason

/// ⚠️ **Warning:** This function decodes the JWT *without verifying its signature*.
/// Use only to inspect the header (e.g., `kid`) before performing a verified decode
/// before finalizing any task.
pub fn unsafe_find_jwt_kid(jwt: &str) -> Result<String, JwtFindKidError> {
    // 1) Header sanity check
    decode_jwt_header(jwt).map_err(JwtFindKidError::from)?;

    // 2) Decode the payload (⚠️ no signature validation)
    let token_data = dangerous::insecure_decode::<UnsafeClaims>(jwt)
        .map_err(|e| JwtFindKidError::BadSig(e.to_string()))?;

    // 3) Return kid
    token_data.header.kid.ok_or(JwtFindKidError::MissingKid)
}

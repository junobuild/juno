use crate::delegation::openid::jwt::types::JwtHeaderError;
use jsonwebtoken::{decode_header, Algorithm, Header};

pub fn decode_jwt_header(jwt: &str) -> Result<Header, JwtHeaderError> {
    let header = decode_header(jwt).map_err(|e| JwtHeaderError::BadSig(e.to_string()))?;

    if header.alg != Algorithm::RS256 {
        return Err(JwtHeaderError::BadClaim("alg".to_string()));
    }

    // If typ is present it must be "JWT".
    if let Some(typ) = header.typ.as_deref() {
        if typ != "JWT" {
            return Err(JwtHeaderError::BadClaim("typ".to_string()));
        }
    }

    Ok(header)
}

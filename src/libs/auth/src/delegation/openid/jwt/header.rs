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

#[cfg(test)]
mod tests {
    use super::decode_jwt_header;
    use crate::delegation::openid::jwt::types::JwtHeaderError;
    use base64::engine::general_purpose::URL_SAFE_NO_PAD;
    use base64::Engine;
    use jsonwebtoken::Algorithm;
    use serde_json::json;

    fn jwt_with_header(header_val: serde_json::Value) -> String {
        let header_json = serde_json::to_string(&header_val).unwrap();
        let header_b64 = URL_SAFE_NO_PAD.encode(header_json);
        let payload_b64 = URL_SAFE_NO_PAD.encode("{}");
        let sig_b64 = URL_SAFE_NO_PAD.encode("sig");
        format!("{header_b64}.{payload_b64}.{sig_b64}")
    }

    #[test]
    fn accepts_rs256_with_typ_jwt() {
        let jwt = jwt_with_header(json!({"alg":"RS256","typ":"JWT"}));
        let header = decode_jwt_header(&jwt).expect("should parse");
        assert_eq!(header.alg, Algorithm::RS256);
        assert_eq!(header.typ.as_deref(), Some("JWT"));
    }

    #[test]
    fn accepts_rs256_without_typ() {
        let jwt = jwt_with_header(json!({"alg":"RS256"}));
        let header = decode_jwt_header(&jwt).expect("typ is optional if present must be JWT");
        assert_eq!(header.alg, Algorithm::RS256);
        assert!(header.typ.is_none());
    }

    #[test]
    fn rejects_non_rs256_alg() {
        let jwt = jwt_with_header(json!({"alg":"HS256","typ":"JWT"}));
        let err = decode_jwt_header(&jwt).unwrap_err();
        match err {
            JwtHeaderError::BadClaim(f) => assert_eq!(f, "alg"),
            other => panic!("expected BadClaim(\"alg\"), got {other:?}"),
        }
    }

    #[test]
    fn rejects_wrong_typ() {
        let jwt = jwt_with_header(json!({"alg":"RS256","typ":"JOT"}));
        let err = decode_jwt_header(&jwt).unwrap_err();
        match err {
            JwtHeaderError::BadClaim(f) => assert_eq!(f, "typ"),
            other => panic!("expected BadClaim(\"typ\"), got {other:?}"),
        }
    }

    #[test]
    fn propagates_decode_errors_as_badsig() {
        let jwt = "this-is-not-a-jwt";
        let err = decode_jwt_header(jwt).unwrap_err();
        match err {
            JwtHeaderError::BadSig(_msg) => { /* ok: message content varies by crate version */ }
            other => panic!("expected BadSig(..), got {other:?}"),
        }
    }
}

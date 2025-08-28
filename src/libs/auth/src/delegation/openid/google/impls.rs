use crate::delegation::openid::google::types::GoogleProvider;
use crate::delegation::openid::types::{OpenIdCredential, OpenIdProvider};
use identity_jose::jwk::{Jwk, JwkParamsRsa};
use identity_jose::jws::JwsAlgorithm::RS256;
use identity_jose::jws::{
    Decoder, JwsVerifierFn, SignatureVerificationError, SignatureVerificationErrorKind,
    VerificationInput,
};

impl OpenIdProvider for GoogleProvider {
    fn verify(&self, jwt: &str, salt: &[u8; 32]) -> Result<OpenIdCredential, String> {
        // let validation_item = Decoder::new()
        //     .decode_compact_serialization(jwt.as_bytes(), None)
        //     .map_err(|_| {
        //         "Unable to decode JWT".to_string()
        //     })?;
        //
        // let claims: Claims = serde_json::from_slice(validation_item.claims()).map_err(|_| {
        //     OpenIDJWTVerificationError::GenericError(
        //         "Unable to decode claims or expected claims are missing".to_string(),
        //     )
        // })?;

        Err("TODO".to_string())
    }
}
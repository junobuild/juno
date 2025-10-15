use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize)]
pub struct Claims {
    pub iss: String,
    pub sub: String,
    pub aud: String,
    pub exp: Option<u64>,
    pub nbf: Option<u64>,
    pub iat: Option<u64>,

    pub email: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,

    pub nonce: Option<String>,
}

/// Minimal JSON Web Keys fetched (e.g. from Google/Apple/Auth0) off-chain.
#[derive(Deserialize)]
pub struct Jwk {
    // Used to select which key in the JWKS to use.
    pub kid: Option<String>,
    // The modulus (part of the RSA public key).
    pub n: String,
    // The exponent (the other part of the RSA public key).
    pub e: String,
}

// JSON Web Key Set
#[derive(Deserialize)]
pub struct Jwks {
    pub keys: Vec<Jwk>,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum JwtFindProviderError {
    BadSig(String),
    BadClaim(String),
    NoMatchingProvider,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum JwtVerifyError {
    MissingKid,
    NoKeyForKid,
    BadSig(String),
    BadClaim(String),
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum JwtHeaderError {
    BadSig(String),
    BadClaim(String),
}

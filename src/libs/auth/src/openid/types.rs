use crate::openid::jwt::types::errors::{JwtFindProviderError, JwtVerifyError};
use candid::{CandidType, Deserialize};
use serde::Serialize;

pub struct OpenIdCredentialKey<'a> {
    pub iss: &'a String,
    pub sub: &'a String,
}

pub struct OpenIdCredential {
    pub iss: String,
    pub sub: String,

    pub email: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum VerifyOpenidCredentialsError {
    ParseJwksFailed(String),
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}

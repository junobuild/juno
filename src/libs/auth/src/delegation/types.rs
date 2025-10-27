use crate::openid::jwkset::types::errors::GetOrRefreshJwksError;
use crate::openid::jwt::types::errors::{JwtFindProviderError, JwtVerifyError};
use crate::state::types::state::Salt;
use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use serde_bytes::ByteBuf;

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdPrepareDelegationArgs {
    pub jwt: String,
    pub salt: Salt,
    pub session_key: SessionKey,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdGetDelegationArgs {
    pub jwt: String,
    pub salt: Salt,
    pub session_key: SessionKey,
}

pub type UserKey = PublicKey;
pub type PublicKey = ByteBuf;
pub type SessionKey = PublicKey;
pub type Timestamp = u64;
pub type Signature = ByteBuf;

pub type PrepareDelegationResult = Result<UserKeyTimestamp, PrepareDelegationError>;
pub type GetDelegationResult = Result<SignedDelegation, GetDelegationError>;

pub type UserKeyTimestamp = (UserKey, Timestamp);

#[derive(CandidType, Serialize, Deserialize)]
pub struct SignedDelegation {
    pub delegation: Delegation,
    pub signature: Signature,
}

pub type DelegationTargets = Vec<Principal>;

#[derive(CandidType, Serialize, Deserialize)]
pub struct Delegation {
    pub pubkey: PublicKey,
    pub expiration: Timestamp,
    pub targets: Option<DelegationTargets>,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum PrepareDelegationError {
    DeriveSeedFailed(String),
    GetOrFetchJwks(GetOrRefreshJwksError),
    GetCachedJwks,
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum GetDelegationError {
    NoSuchDelegation,
    DeriveSeedFailed(String),
    GetOrFetchJwks(GetOrRefreshJwksError),
    GetCachedJwks,
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}

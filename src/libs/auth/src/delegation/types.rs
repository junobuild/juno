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
    // TODO: max_time_to_live opt<u64>
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct OpenIdGetDelegationArgs {
    pub jwt: String,
    pub salt: Salt,
    pub session_key: SessionKey,
    pub expiration: Timestamp,
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

#[derive(CandidType, Serialize, Deserialize)]
pub struct Delegation {
    pub pubkey: PublicKey,
    pub expiration: Timestamp,
    pub targets: Option<Vec<Principal>>,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum PrepareDelegationError {
    DeriveSeedFailed(String),
    ParseJwksFailed(String),
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub enum GetDelegationError {
    NoSuchDelegation,
    DeriveSeedFailed(String),
    ParseJwksFailed(String),
    JwtFindProvider(JwtFindProviderError),
    JwtVerify(JwtVerifyError),
}

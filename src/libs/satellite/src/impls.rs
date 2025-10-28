use crate::memory::internal::init_stable_state;
use crate::types::interface::{
    AuthenticateUserResult, AuthenticateUserResultResponse, GetDelegationResultResponse,
};
use crate::types::state::{CollectionType, HeapState, RuntimeState, State};
use junobuild_auth::delegation::types::{GetDelegationError, SignedDelegation};
use std::fmt::{Display, Formatter, Result as FmtResult};

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
            runtime: RuntimeState::default(),
        }
    }
}

impl Display for CollectionType {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(
            f,
            "{}",
            match self {
                CollectionType::Db => "db",
                CollectionType::Storage => "storage",
            }
        )
    }
}

impl From<Result<SignedDelegation, GetDelegationError>> for GetDelegationResultResponse {
    fn from(r: Result<SignedDelegation, GetDelegationError>) -> Self {
        match r {
            Ok(v) => Self::Ok(v),
            Err(e) => Self::Err(e),
        }
    }
}

impl From<AuthenticateUserResult> for AuthenticateUserResultResponse {
    fn from(r: AuthenticateUserResult) -> Self {
        match r {
            Ok(v) => Self::Ok(v),
            Err(e) => Self::Err(e),
        }
    }
}

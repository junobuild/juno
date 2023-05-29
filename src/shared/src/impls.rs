use crate::types::ledger::{BlockIndexed, Transaction};
use crate::types::memory::StablePrincipal;
use crate::types::state::Controller;
use candid::{decode_one, encode_one, Principal};
use ic_stable_structures::{BoundedStorable, Storable};
use std::borrow::Cow;

impl From<&BlockIndexed> for Transaction {
    fn from((block_index, block): &BlockIndexed) -> Self {
        Transaction {
            block_index: *block_index,
            memo: block.transaction.memo,
            operation: block.transaction.operation.clone(),
            timestamp: block.timestamp,
        }
    }
}

impl From<&Principal> for StablePrincipal {
    fn from(principal: &Principal) -> Self {
        StablePrincipal(*principal)
    }
}

impl StablePrincipal {
    pub fn to_principal(&self) -> Principal {
        self.0
    }
}

/// Source: https://forum.dfinity.org/t/increased-canister-smart-contract-memory/6148/160?u=peterparker
impl Storable for StablePrincipal {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Borrowed(self.0.as_slice())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self(Principal::from_slice(bytes.as_ref()))
    }
}

impl BoundedStorable for StablePrincipal {
    const MAX_SIZE: u32 = 29;
    const IS_FIXED_SIZE: bool = false;
}

impl Storable for Controller {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for Controller {
    const MAX_SIZE: u32 = 10 * 1024 * 1024; // 10 MB
    const IS_FIXED_SIZE: bool = false;
}

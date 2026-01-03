use crate::memory::manager::init_stable_state;
use crate::types::ledger::{Fee, IcpPayment, IcrcPayment, IcrcPaymentKey};
use crate::types::state::{
    Account, HeapState, Rate, Rates, Segment, SegmentKey, SegmentType, State,
};
use candid::Principal;
use ic_cdk::api::time;
use ic_ledger_types::{BlockIndex, Tokens};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::ledger::types::cycles::CyclesTokens;
use junobuild_shared::memory::serializers::{
    deserialize_from_bytes, serialize_into_bytes, serialize_to_bytes,
};
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::types::state::{Metadata, SegmentId, Timestamp, UserId};
use std::borrow::Cow;
use std::collections::HashMap;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState::default(),
        }
    }
}

impl Default for Rates {
    fn default() -> Self {
        let now = time();

        let tokens: RateTokens = RateTokens {
            tokens: 1,
            updated_at: now,
        };

        Rates {
            satellites: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            mission_controls: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens: tokens.clone(),
            },
            orbiters: Rate {
                config: DEFAULT_RATE_CONFIG,
                tokens,
            },
        }
    }
}

impl Storable for Account {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for IcpPayment {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Segment {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for SegmentKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for IcrcPayment {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for IcrcPaymentKey {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        serialize_to_bytes(self)
    }

    fn into_bytes(self) -> Vec<u8> {
        serialize_into_bytes(&self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Segment {
    pub fn init_metadata(name: &Option<String>) -> Metadata {
        match name {
            Some(name) => HashMap::from([("name".to_string(), name.to_owned())]),
            None => HashMap::new(),
        }
    }

    pub fn new(segment_id: &SegmentId, metadata: Option<Metadata>) -> Self {
        let now = time();

        Self {
            segment_id: *segment_id,
            metadata: metadata.unwrap_or(HashMap::new()),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn with_metadata(&self, metadata: &Metadata) -> Self {
        let updated_at: Timestamp = time();

        Self {
            metadata: metadata.clone(),
            updated_at,
            ..self.clone()
        }
    }
}

impl SegmentKey {
    pub fn from(user: &UserId, segment_id: &SegmentId, segment_type: SegmentType) -> Self {
        Self {
            user: *user,
            segment_type,
            segment_id: *segment_id,
        }
    }
}

impl IcrcPaymentKey {
    pub fn from(ledger_id: &Principal, block_index: &BlockIndex) -> Self {
        Self {
            ledger_id: *ledger_id,
            block_index: *block_index,
        }
    }
}

impl Fee {
    pub fn amount(&self) -> u64 {
        match self {
            Fee::Cycles(cycles) => cycles.e12s(),
            Fee::ICP(tokens) => tokens.e8s(),
        }
    }

    pub fn as_icp(&self) -> Result<Tokens, String> {
        match self {
            Fee::ICP(tokens) => Ok(*tokens),
            Fee::Cycles(_) => Err("Expected ICP fee but got Cycles fee".to_string()),
        }
    }

    pub fn as_cycles(&self) -> Result<CyclesTokens, String> {
        match self {
            Fee::Cycles(cycles) => Ok(cycles.clone()),
            Fee::ICP(_) => Err("Expected Cycles fee but got ICP fee".to_string()),
        }
    }
}

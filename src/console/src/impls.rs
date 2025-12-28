use crate::constants::{
    MISSION_CONTROL_CREATION_FEE_ICP, ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_ICP,
};
use crate::memory::manager::init_stable_state;
use crate::types::ledger::Payment;
use crate::types::state::{
    Account, FactoryFee, FactoryFees, Fee, Fees, HeapState, Rate, Rates, Segment, SegmentKey,
    SegmentType, State,
};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::rate::constants::DEFAULT_RATE_CONFIG;
use junobuild_shared::rate::types::RateTokens;
use junobuild_shared::serializers::{
    deserialize_from_bytes, serialize_into_bytes, serialize_to_bytes,
};
use junobuild_shared::types::state::{Metadata, SegmentId, UserId};
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

impl Default for Fees {
    fn default() -> Self {
        let now = time();

        Fees {
            satellite: Fee {
                fee: SATELLITE_CREATION_FEE_ICP,
                updated_at: now,
            },
            orbiter: Fee {
                fee: ORBITER_CREATION_FEE_ICP,
                updated_at: now,
            },
        }
    }
}

impl Default for FactoryFees {
    fn default() -> Self {
        let now = time();

        Self {
            satellite: FactoryFee {
                fee_icp: SATELLITE_CREATION_FEE_ICP,
                updated_at: now,
            },
            orbiter: FactoryFee {
                fee_icp: ORBITER_CREATION_FEE_ICP,
                updated_at: now,
            },
            mission_control: FactoryFee {
                fee_icp: MISSION_CONTROL_CREATION_FEE_ICP,
                updated_at: now,
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

impl Storable for Payment {
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

fn init_metadata(name: &Option<String>) -> Metadata {
    match name {
        Some(name) => HashMap::from([("name".to_string(), name.to_owned())]),
        None => HashMap::new(),
    }
}

impl Segment {
    pub fn from(segment_id: &SegmentId, name: &Option<String>) -> Self {
        let now = time();

        Self {
            segment_id: *segment_id,
            metadata: init_metadata(name),
            created_at: now,
            updated_at: now,
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

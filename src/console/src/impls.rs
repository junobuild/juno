use crate::constants::{DEFAULT_RATE_CONFIG, ORBITER_CREATION_FEE_ICP, SATELLITE_CREATION_FEE_ICP};
use crate::memory::init_stable_state;
use crate::storage::types::state::StorageHeapState;
use crate::types::ledger::Payment;
use crate::types::state::{Fee, Fees, HeapState, MissionControl, Rate, RateTokens, Rates, State};
use ic_cdk::api::time;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use std::borrow::Cow;

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

impl Storable for MissionControl {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Payment {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl HeapState {
    pub fn get_storage(&self) -> StorageHeapState {
        self.storage.clone().unwrap_or_default()
    }
}

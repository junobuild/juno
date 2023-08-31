use crate::constants::KEY_MAX_LENGTH;
use crate::memory::init_stable_state;
use crate::types::state::{AnalyticKey, HeapState, OriginConfigs, PageView, State, TrackEvent};
use candid::{decode_one, encode_one};
use ic_stable_structures::{BoundedStorable, Storable};
use shared::types::state::Controllers;
use shared::utils::{bytes_to_principal, principal_to_bytes};
use std::borrow::Cow;
use std::mem::size_of;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState {
                controllers: Controllers::default(),
                origins: OriginConfigs::default(),
            },
        }
    }
}

impl Storable for PageView {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for PageView {
    // const MAX_SIZE: u32 = size_of::<PageView>() as u32;
    const MAX_SIZE: u32 = 100_000;
    const IS_FIXED_SIZE: bool = false;
}

impl Storable for TrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for TrackEvent {
    // Size of TrackEvent:
    // - name (String)
    // - collected_at + created_at + updated_at (3 * u64)
    // - metadata (2 * String) limited to TRACK_EVENT_METADATA_MAX_LENGTH entries
    // const MAX_SIZE: u32 = size_of::<String>() as u32
    //    + (size_of::<u64>() as u32 * 3)
    //    + (size_of::<String>() as u32 * 2 * TRACK_EVENT_METADATA_MAX_LENGTH);
    const MAX_SIZE: u32 = 100_000;
    const IS_FIXED_SIZE: bool = false;
}

// Size of AnalyticKey:
// - key + session_id (2 * String max length KEY_MAX_LENGTH)
// - Principal to bytes (30 because a principal is max 29 bytes and one byte to save effective length)
const ANALYTIC_KEY_MAX_SIZE: u32 = (KEY_MAX_LENGTH * 2) + 30;

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = Vec::with_capacity(usize::try_from(ANALYTIC_KEY_MAX_SIZE).unwrap());

        buf.extend(principal_to_bytes(&self.satellite_id));
        buf.extend(self.key.as_bytes());
        buf.extend(self.session_id.as_bytes());

        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        AnalyticKey {
            satellite_id: bytes_to_principal(
                TryFrom::try_from(&bytes[0..30]).expect("Failed to deserialize satellite_id"),
            ),
            key: String::from_bytes(
                TryFrom::try_from(&bytes[30..(30 + size_of::<String>())])
                    .expect("Failed to deserialize key"),
            ),
            session_id: String::from_bytes(
                TryFrom::try_from(&bytes[(30 + size_of::<String>())..])
                    .expect("Failed to deserialize session_id"),
            ),
        }
    }
}

impl BoundedStorable for AnalyticKey {
    const MAX_SIZE: u32 = ANALYTIC_KEY_MAX_SIZE;
    const IS_FIXED_SIZE: bool = false;
}

use crate::constants::TRACK_EVENT_METADATA_MAX_LENGTH;
use crate::memory::init_stable_state;
use crate::types::state::{AnalyticKey, HeapState, OriginConfigs, PageView, State, TrackEvent};
use candid::{decode_one, encode_one};
use ic_stable_structures::{BoundedStorable, Storable};
use shared::types::state::Controllers;
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
    const MAX_SIZE: u32 = size_of::<PageView>() as u32;
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
    const MAX_SIZE: u32 = size_of::<String>() as u32
        + (size_of::<u64>() as u32 * 3)
        + (size_of::<String>() as u32 * 2 * TRACK_EVENT_METADATA_MAX_LENGTH);
    const IS_FIXED_SIZE: bool = false;
}

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        decode_one(&bytes).unwrap()
    }
}

impl BoundedStorable for AnalyticKey {
    // Size of AnalyticKey:
    // - key + session_id (2 * String)
    // - Principal (between 0 and 29 bytes)
    const MAX_SIZE: u32 = (size_of::<String>() as u32 * 2) + 29;
    const IS_FIXED_SIZE: bool = false;
}

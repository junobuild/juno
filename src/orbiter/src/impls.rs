use crate::memory::init_stable_state;
use crate::types::state::{AnalyticKey, HeapState, OriginConfigs, PageView, State, TrackEvent};
use candid::{decode_one, encode_one};
use ic_stable_structures::{BoundedStorable, Storable};
use shared::types::state::Controllers;
use std::borrow::Cow;

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
    // TODO: auto max_size
    const MAX_SIZE: u32 = 100_000; // 0.1 MB
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
    // TODO: auto max_size
    const MAX_SIZE: u32 = 100_000; // 0.1 MB
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
    // TODO: auto max_size
    const MAX_SIZE: u32 = 100_000; // 0.1 MB
    const IS_FIXED_SIZE: bool = false;
}

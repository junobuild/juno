use crate::constants::{
    METADATA_MAX_ELEMENTS, SERIALIZED_KEY_LENGTH, SERIALIZED_METADATA_LENGTH,
    SERIALIZED_PRINCIPAL_LENGTH, SERIALIZED_STRING_LENGTH,
};
use crate::memory::init_stable_state;
use crate::types::state::{AnalyticKey, HeapState, OriginConfigs, PageView, State, TrackEvent};
use crate::utils::{
    bytes_to_key, bytes_to_metadata, bytes_to_principal, bytes_to_string, key_to_bytes,
    metadata_to_bytes, principal_to_bytes, string_to_bytes,
};
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
    // const MAX_SIZE: u32 = size_of::<PageView>() as u32;
    const MAX_SIZE: u32 = 100_000;
    const IS_FIXED_SIZE: bool = false;
}

// Size of TrackEvent:
// - name (String)
// - collected_at + created_at + updated_at (3 * u64)
// - metadata (2 * String) limited to TRACK_EVENT_METADATA_MAX_LENGTH entries
const TRACK_EVENT_MAX_SIZE: usize = SERIALIZED_STRING_LENGTH
    + (size_of::<u64>() * 3)
    + (SERIALIZED_STRING_LENGTH * 2 * METADATA_MAX_ELEMENTS);

impl Storable for TrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = Vec::with_capacity(TRACK_EVENT_MAX_SIZE);

        buf.extend(string_to_bytes(&self.name));
        buf.extend(metadata_to_bytes(&self.metadata));
        buf.extend(self.collected_at.to_be_bytes());
        buf.extend(self.created_at.to_be_bytes());
        buf.extend(self.updated_at.to_be_bytes());

        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        TrackEvent {
            name: bytes_to_string(
                TryFrom::try_from(&bytes[0..SERIALIZED_STRING_LENGTH])
                    .expect("Failed to deserialize name"),
            ),
            metadata: bytes_to_metadata(
                TryFrom::try_from(
                    &bytes[SERIALIZED_STRING_LENGTH
                        ..SERIALIZED_STRING_LENGTH + SERIALIZED_METADATA_LENGTH],
                )
                .expect("Failed to deserialize name"),
            ),
            collected_at: u64::from_be_bytes(
                TryFrom::try_from(&bytes[8..16]).expect("Failed to deserialize collected_at"),
            ),
            created_at: u64::from_be_bytes(
                TryFrom::try_from(&bytes[8..16]).expect("Failed to deserialize created_at"),
            ),
            updated_at: u64::from_be_bytes(
                TryFrom::try_from(&bytes[8..16]).expect("Failed to deserialize updated_at"),
            ),
        }
    }
}

impl BoundedStorable for TrackEvent {
    const MAX_SIZE: u32 = TRACK_EVENT_MAX_SIZE as u32;
    const IS_FIXED_SIZE: bool = false;
}

// Size of AnalyticKey:
// - key + session_id (2 * String max length KEY_MAX_LENGTH)
// - Principal to bytes (30 because a principal is max 29 bytes and one byte to save effective length)
const ANALYTIC_KEY_MAX_SIZE: usize = (SERIALIZED_KEY_LENGTH * 2) + SERIALIZED_PRINCIPAL_LENGTH;

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = Vec::with_capacity(ANALYTIC_KEY_MAX_SIZE);

        buf.extend(principal_to_bytes(&self.satellite_id));
        buf.extend(key_to_bytes(&self.key));
        buf.extend(key_to_bytes(&self.session_id));

        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        AnalyticKey {
            satellite_id: bytes_to_principal(
                TryFrom::try_from(&bytes[0..SERIALIZED_PRINCIPAL_LENGTH])
                    .expect("Failed to deserialize satellite_id"),
            ),
            key: bytes_to_key(
                TryFrom::try_from(
                    &bytes[SERIALIZED_PRINCIPAL_LENGTH
                        ..(SERIALIZED_PRINCIPAL_LENGTH + SERIALIZED_KEY_LENGTH)],
                )
                .expect("Failed to deserialize key"),
            ),
            session_id: bytes_to_key(
                TryFrom::try_from(&bytes[(SERIALIZED_PRINCIPAL_LENGTH + SERIALIZED_KEY_LENGTH)..])
                    .expect("Failed to deserialize session_id"),
            ),
        }
    }
}

impl BoundedStorable for AnalyticKey {
    const MAX_SIZE: u32 = ANALYTIC_KEY_MAX_SIZE as u32;
    const IS_FIXED_SIZE: bool = false;
}

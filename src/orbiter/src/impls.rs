use crate::constants::SERIALIZED_PRINCIPAL_LENGTH;
use crate::memory::init_stable_state;
use crate::types::memory::StoredSatelliteId;
use crate::types::state::{
    AnalyticKey, AnalyticSatelliteKey, HeapState, PageView, PageViewDevice, SatelliteConfigs,
    State, TrackEvent,
};
use candid::Principal;
use ic_stable_structures::storable::{Blob, Bound};
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::{Controllers, SatelliteId};
use std::borrow::Cow;
use std::mem::size_of;

impl Default for State {
    fn default() -> Self {
        Self {
            stable: init_stable_state(),
            heap: HeapState {
                controllers: Controllers::default(),
                config: SatelliteConfigs::default(),
            },
        }
    }
}

impl Storable for PageView {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for TrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AnalyticSatelliteKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Source: https://forum.dfinity.org/t/convert-principal-to-vec-29-bytes-length/22468/3
impl Storable for StoredSatelliteId {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut bytes: [u8; SERIALIZED_PRINCIPAL_LENGTH] = [0; SERIALIZED_PRINCIPAL_LENGTH];
        let p_bytes: &[u8] = self.get_id().as_slice();
        bytes[0] = p_bytes.len() as u8;
        bytes[1..p_bytes.len() + 1].copy_from_slice(p_bytes);

        Cow::Owned(bytes.to_vec())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        Self(Principal::from_slice(&bytes[1..1 + bytes[0] as usize]))
    }

    const BOUND: Bound = Blob::<SERIALIZED_PRINCIPAL_LENGTH>::BOUND;
}

impl StoredSatelliteId {
    pub fn get_id(&self) -> &SatelliteId {
        &self.0
    }
}

const SERIALIZED_PAGE_VIEW_DEVICE_LENGTH: usize = size_of::<u16>() * 2;

impl Storable for PageViewDevice {
    fn to_bytes(&self) -> Cow<'_, [u8]> {
        let mut bytes = Vec::with_capacity(SERIALIZED_PAGE_VIEW_DEVICE_LENGTH);
        bytes.extend_from_slice(&self.inner_width.to_be_bytes());
        bytes.extend_from_slice(&self.inner_height.to_be_bytes());

        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        let size: usize = size_of::<u16>();

        let inner_width = u16::from_be_bytes(
            bytes[0..size]
                .try_into()
                .expect("Failed to deserialize inner_width"),
        );

        let inner_height = u16::from_be_bytes(
            bytes[size..size * 2]
                .try_into()
                .expect("Failed to deserialize inner_height"),
        );

        PageViewDevice {
            inner_width,
            inner_height,
        }
    }

    const BOUND: Bound = Blob::<SERIALIZED_PAGE_VIEW_DEVICE_LENGTH>::BOUND;
}

/// Key conversion

impl AnalyticSatelliteKey {
    pub fn from_key(key: &AnalyticKey, satellite_id: &SatelliteId) -> Self {
        AnalyticSatelliteKey {
            satellite_id: StoredSatelliteId(*satellite_id),
            collected_at: key.collected_at,
            key: key.key.clone(),
        }
    }
}

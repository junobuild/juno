use crate::constants::SERIALIZED_PRINCIPAL_LENGTH;
use crate::memory::init_stable_state;
use crate::types::memory::StoredSatelliteId;
use crate::types::state::{
    AnalyticKey, AnalyticSatelliteKey, HeapState, PageView, SatelliteConfigs, State, TrackEvent,
};
use candid::Principal;
use ic_stable_structures::storable::{Blob, Bound};
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::{Controllers, SatelliteId};
use std::borrow::Cow;

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
    const BOUND: Bound = Blob::<SERIALIZED_PRINCIPAL_LENGTH>::BOUND;

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
}

impl StoredSatelliteId {
    pub fn get_id(&self) -> &SatelliteId {
        &self.0
    }
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

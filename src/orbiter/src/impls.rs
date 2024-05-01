use crate::memory::init_stable_state;
use crate::types::state::{
    AnalyticKey, AnalyticSatelliteKey, HeapState, PageView, SatelliteConfigs,
    State, TrackEvent,
};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::types::state::{Controllers, SatelliteId};
use std::borrow::Cow;
use ciborium::from_reader;
use junobuild_shared::serializers::serialize_to_bytes;
use crate::serializers::bounded::{deserialize_bounded_analytic_key, deserialize_bounded_page_view, deserialize_bounded_track_event, deserialize_bounded_analytic_satellite_key};

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
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_page_view(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for TrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_track_event(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_analytic_key(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AnalyticSatelliteKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_analytic_satellite_key(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

/// Key conversion

impl AnalyticSatelliteKey {
    pub fn from_key(key: &AnalyticKey, satellite_id: &SatelliteId) -> Self {
        AnalyticSatelliteKey {
            satellite_id: *satellite_id,
            collected_at: key.collected_at,
            key: key.key.clone(),
        }
    }
}

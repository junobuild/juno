use crate::memory::init_stable_state;
use crate::serializers::bounded::{
    deserialize_bounded_analytic_key, deserialize_bounded_analytic_satellite_key,
    deserialize_bounded_page_view, deserialize_bounded_track_event, serialize_bounded_analytic_key,
    serialize_bounded_analytic_satellite_key, serialize_bounded_page_view,
    serialize_bounded_track_event,
};
use crate::types::memory::MemoryAllocation;
use crate::types::state::{
    AnalyticKey, AnalyticSatelliteKey, HeapState, PageView, SatelliteConfigs, State, TrackEvent,
};
use ciborium::from_reader;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::serialize_to_bytes;
use junobuild_shared::types::state::{Controllers, SatelliteId};
use std::borrow::Cow;
use crate::serializers::constants::{ANALYTIC_KEY_MAX_SIZE, ANALYTIC_SATELLITE_KEY_MAX_SIZE};

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
        match self.memory_allocation {
            Some(MemoryAllocation::Bounded) => serialize_bounded_page_view(self),
            _ => serialize_to_bytes(self),
        }
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_page_view(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for TrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        match self.memory_allocation {
            Some(MemoryAllocation::Bounded) => serialize_bounded_track_event(self),
            _ => serialize_to_bytes(self),
        }
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes).unwrap_or_else(|_| deserialize_bounded_track_event(bytes))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for AnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_bounded_analytic_key(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_bounded_analytic_key(bytes)
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: ANALYTIC_KEY_MAX_SIZE as u32,
        is_fixed_size: false,
    };
}

impl Storable for AnalyticSatelliteKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_bounded_analytic_satellite_key(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_bounded_analytic_satellite_key(bytes)
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: ANALYTIC_SATELLITE_KEY_MAX_SIZE as u32,
        is_fixed_size: false,
    };
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

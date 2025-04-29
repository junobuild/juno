use crate::serializers::bounded::{
    deserialize_bounded_analytic_key, deserialize_bounded_analytic_satellite_key,
    deserialize_bounded_page_view, deserialize_bounded_track_event, serialize_bounded_analytic_key,
    serialize_bounded_analytic_satellite_key, serialize_bounded_page_view,
    serialize_bounded_track_event,
};
use crate::serializers::constants::{ANALYTIC_KEY_MAX_SIZE, ANALYTIC_SATELLITE_KEY_MAX_SIZE};
use crate::state::memory::init_stable_state;
use crate::state::types::memory::{StoredPageView, StoredTrackEvent};
use crate::state::types::state::{AnalyticKey, AnalyticSatelliteKey, HeapState, PageView, PerformanceMetric, SatelliteConfigs, SessionId, State, TrackEvent};
use ciborium::from_reader;
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use junobuild_shared::serializers::{deserialize_from_bytes, serialize_to_bytes};
use junobuild_shared::types::state::{Controllers, SatelliteId, Version, Versioned};
use std::borrow::Cow;
use junobuild_shared::day::start_of_day;
use crate::state::types::state::analytics::{DailyPageViews, DailyAnalyticKey, DailyAnalyticSatelliteKey, DailySessionViews, DailySessionsAnalyticKey, DailySessionsAnalyticSatelliteKey};

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

impl Storable for StoredPageView {
    fn to_bytes(&self) -> Cow<[u8]> {
        match self {
            StoredPageView::Unbounded(page_view) => serialize_to_bytes(page_view),
            StoredPageView::Bounded(page_view) => serialize_bounded_page_view(page_view),
        }
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes)
            .map(StoredPageView::Unbounded)
            .unwrap_or_else(|_| StoredPageView::Bounded(deserialize_bounded_page_view(bytes)))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl StoredPageView {
    pub fn into_inner(self) -> PageView {
        match self {
            StoredPageView::Unbounded(page_view) | StoredPageView::Bounded(page_view) => page_view,
        }
    }

    pub fn inner(&self) -> &PageView {
        match self {
            StoredPageView::Unbounded(page_view) | StoredPageView::Bounded(page_view) => page_view,
        }
    }

    pub fn is_bounded(&self) -> bool {
        matches!(self, StoredPageView::Bounded(_))
    }
}

impl Versioned for StoredPageView {
    fn version(&self) -> Option<Version> {
        self.inner().version
    }
}

impl Storable for StoredTrackEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        match self {
            StoredTrackEvent::Unbounded(track_event) => serialize_to_bytes(track_event),
            StoredTrackEvent::Bounded(track_event) => serialize_bounded_track_event(track_event),
        }
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        from_reader(&*bytes)
            .map(StoredTrackEvent::Unbounded)
            .unwrap_or_else(|_| StoredTrackEvent::Bounded(deserialize_bounded_track_event(bytes)))
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl StoredTrackEvent {
    pub fn into_inner(self) -> TrackEvent {
        match self {
            StoredTrackEvent::Unbounded(track_event) | StoredTrackEvent::Bounded(track_event) => {
                track_event
            }
        }
    }

    pub fn inner(&self) -> &TrackEvent {
        match self {
            StoredTrackEvent::Unbounded(track_event) | StoredTrackEvent::Bounded(track_event) => {
                track_event
            }
        }
    }

    pub fn is_bounded(&self) -> bool {
        matches!(self, StoredTrackEvent::Bounded(_))
    }
}

impl Versioned for StoredTrackEvent {
    fn version(&self) -> Option<Version> {
        self.inner().version
    }
}

impl Storable for PerformanceMetric {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Versioned for PerformanceMetric {
    fn version(&self) -> Option<Version> {
        self.version
    }
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

impl Storable for DailyPageViews {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for DailySessionViews {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for DailyAnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for DailyAnalyticSatelliteKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for DailySessionsAnalyticKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for DailySessionsAnalyticSatelliteKey {
    fn to_bytes(&self) -> Cow<[u8]> {
        serialize_to_bytes(self)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_from_bytes(bytes)
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Versioned for DailyPageViews {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

impl Versioned for DailySessionViews {
    fn version(&self) -> Option<Version> {
        self.version
    }
}

// ---------------------------------------------------------
// Key conversion
// ---------------------------------------------------------

impl AnalyticSatelliteKey {
    pub fn from_key(key: &AnalyticKey, satellite_id: &SatelliteId) -> Self {
        AnalyticSatelliteKey {
            satellite_id: *satellite_id,
            collected_at: key.collected_at,
            key: key.key.clone(),
        }
    }
}

impl DailyAnalyticKey {
    pub fn from_analytic_key(key: &AnalyticKey) -> Result<Self, String> {
        Ok(Self {
            start_of_day: start_of_day(&key.collected_at)?,
        })
    }
}

impl DailySessionsAnalyticKey {
    pub fn from_analytic_key_and_page_view(key: &AnalyticKey, page_view: &PageView) -> Result<Self, String> {
        Ok(Self {
            start_of_day: start_of_day(&key.collected_at)?,
            session_id: page_view.session_id.clone(),
        })
    }
}

impl DailyAnalyticSatelliteKey {
    pub fn from_key(key: &DailyAnalyticKey, satellite_id: &SatelliteId) -> Self {
        DailyAnalyticSatelliteKey {
            satellite_id: *satellite_id,
            start_of_day: key.start_of_day,
        }
    }
}

impl DailySessionsAnalyticSatelliteKey {
    pub fn from_key(key: &DailySessionsAnalyticKey, satellite_id: &SatelliteId, session_id: &SessionId) -> Self {
        DailySessionsAnalyticSatelliteKey {
            satellite_id: *satellite_id,
            start_of_day: key.start_of_day,
            session_id: session_id.clone(),
        }
    }
}

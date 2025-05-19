pub mod upgrade {
    use crate::memory::init_stable_state;
    use crate::types::state::{MissionControlSettings, Orbiters, Satellites, StableState, User};
    use candid::{CandidType, Principal};
    use junobuild_shared::types::state::{Controllers, Metadata, SegmentCanisterStatus, Timestamp};
    use serde::{Deserialize, Serialize};
    use std::collections::{BTreeMap, HashMap};

    #[derive(Serialize, Deserialize)]
    pub struct UpgradeState {
        #[serde(skip, default = "init_stable_state")]
        pub stable: StableState,

        pub heap: UpgradeHeapState,
    }

    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct UpgradeHeapState {
        pub user: User,
        pub satellites: Satellites,
        pub controllers: Controllers,
        #[deprecated(
            note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
        )]
        pub archive: Archive,
        pub orbiters: Orbiters,
        pub settings: Option<MissionControlSettings>,
    }

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: ArchiveStatuses,
    }

    pub type ArchiveTime = u64;

    #[deprecated]
    #[derive(CandidType, Serialize, Deserialize, Clone)]
    pub struct SegmentStatus {
        pub id: Principal,
        pub metadata: Option<Metadata>,
        pub status: SegmentCanisterStatus,
        pub status_at: Timestamp,
    }

    #[deprecated]
    pub type SegmentStatusResult = Result<SegmentStatus, String>;

    #[deprecated]
    #[derive(CandidType, Deserialize, Clone)]
    pub struct SegmentsStatuses {
        pub mission_control: SegmentStatusResult,
        pub satellites: Option<Vec<SegmentStatusResult>>,
        pub orbiters: Option<Vec<SegmentStatusResult>>,
    }

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    pub type Statuses = BTreeMap<ArchiveTime, SegmentStatusResult>;

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    pub type ArchiveStatusesSegments = HashMap<Principal, Statuses>;

    #[deprecated(
        since = "0.0.14",
        note = "Deprecated with the introduction of monitoring features that include auto top-up capabilities."
    )]
    #[derive(Default, CandidType, Serialize, Deserialize, Clone)]
    pub struct ArchiveStatuses {
        pub mission_control: Statuses,
        pub satellites: ArchiveStatusesSegments,
        pub orbiters: ArchiveStatusesSegments,
    }
}

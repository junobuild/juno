pub mod state {
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::interface::SegmentsStatuses;
    use shared::types::state::{Controllers, MissionControlId, UserId};
    use std::collections::{BTreeMap, HashMap};

    pub type CronTabs = HashMap<UserId, CronTab>;

    pub type ArchiveTime = u64;
    pub type ArchiveStatuses = BTreeMap<ArchiveTime, Result<SegmentsStatuses, String>>;
    pub type Statuses = HashMap<UserId, ArchiveStatuses>;

    #[derive(Default, Clone)]
    pub struct State {
        pub stable: StableState,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct StableState {
        // Controllers of the observatory - i.e. of the canister (can start, stop the canister etc.)
        pub controllers: Controllers,
        // Additional controllers which can start and collect results of the cron_jobs only
        pub cron_controllers: Controllers,
        pub cron_tabs: CronTabs,
        pub archive: Archive,
    }

    #[derive(CandidType, Deserialize, Clone)]
    pub struct CronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub created_at: u64,
        pub updated_at: u64,
    }

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct Archive {
        pub statuses: Statuses,
    }
}

pub mod list {
    use crate::types::state::ArchiveTime;
    use candid::{CandidType, Deserialize};
    use shared::types::interface::SegmentsStatuses;
    use shared::types::state::UserId;

    #[derive(CandidType, Deserialize, Clone)]
    pub struct ListLastStatuses {
        pub user: UserId,
        pub timestamp: ArchiveTime,
        pub statuses: Result<SegmentsStatuses, String>,
    }
}

pub mod interface {
    use crate::types::state::ArchiveTime;
    use candid::{CandidType, Deserialize};
    use shared::types::cronjob::CronJobs;
    use shared::types::interface::SegmentsStatuses;
    use shared::types::state::MissionControlId;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct CollectStatusesArgs {
        pub collected_after: Option<u64>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct CollectStatuses {
        pub cron_jobs: CronJobs,
        pub timestamp: ArchiveTime,
        pub statuses: Result<SegmentsStatuses, String>,
    }

    #[derive(CandidType, Deserialize)]
    pub struct SetCronTab {
        pub mission_control_id: MissionControlId,
        pub cron_jobs: CronJobs,
        pub updated_at: Option<u64>,
    }
}

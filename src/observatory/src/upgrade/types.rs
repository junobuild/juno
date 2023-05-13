pub mod upgrade {
    use crate::types::state::{Archive, CronTabs};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::state::Controllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: Controllers,
        pub cron_tabs: CronTabs,
        pub archive: Archive,
    }
}

pub mod upgrade {
    use crate::types::state::{Archive, CronTabs};
    use candid::CandidType;
    use serde::Deserialize;
    use shared::types::upgrade::UpgradeControllers;

    #[derive(Default, CandidType, Deserialize, Clone)]
    pub struct UpgradeStableState {
        pub controllers: UpgradeControllers,
        pub cron_controllers: UpgradeControllers,
        pub cron_tabs: CronTabs,
        pub archive: Archive,
    }
}

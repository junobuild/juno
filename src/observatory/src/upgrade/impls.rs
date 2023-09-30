use crate::types::state::{Archive, CronTab, CronTabs, StableState};
use crate::upgrade::types::upgrade::UpgradeStableState;
use shared::types::cronjob::{CronJobStatuses, CronJobs};
use std::collections::HashMap;

impl From<&UpgradeStableState> for StableState {
    fn from(state: &UpgradeStableState) -> Self {
        // For simplicity reason, no migration of the statuses. A new batch will collect the new statuses.

        let mut cron_tabs: CronTabs = HashMap::new();

        for (user_id, upgrade_cron_tab) in state.cron_tabs.clone() {
            let cron_tab: CronTab = CronTab {
                mission_control_id: upgrade_cron_tab.mission_control_id,
                cron_jobs: CronJobs {
                    metadata: upgrade_cron_tab.cron_jobs.metadata,
                    statuses: CronJobStatuses {
                        enabled: upgrade_cron_tab.cron_jobs.statuses.enabled,
                        cycles_threshold: upgrade_cron_tab.cron_jobs.statuses.cycles_threshold,
                        mission_control_cycles_threshold: upgrade_cron_tab
                            .cron_jobs
                            .statuses
                            .mission_control_cycles_threshold,
                        satellites: upgrade_cron_tab.cron_jobs.statuses.satellites,
                        orbiters: HashMap::new(),
                    },
                },
                updated_at: upgrade_cron_tab.updated_at,
                created_at: upgrade_cron_tab.created_at,
            };

            cron_tabs.insert(user_id, cron_tab);
        }

        StableState {
            controllers: state.controllers.clone(),
            cron_tabs,
            archive: Archive {
                statuses: HashMap::new(),
            },
        }
    }
}

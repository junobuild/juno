use crate::store::{get_cron_tab, list_statuses as list_statuses_store};
use crate::types::interface::{CollectStatuses, CollectStatusesArgs};
use crate::types::state::ArchiveStatuses;
use ic_cdk::api::time;
use shared::types::state::UserId;

pub fn collect_statuses(args: &CollectStatusesArgs) -> Vec<CollectStatuses> {
    let statuses = list_statuses_store();

    fn list_statuses(
        (user, status): &(UserId, ArchiveStatuses),
        CollectStatusesArgs { time_delta }: &CollectStatusesArgs,
    ) -> Option<CollectStatuses> {
        let cron_tab = get_cron_tab(user);

        match cron_tab {
            None => None,
            Some(cron_tab) => {
                if !cron_tab.cron_jobs.statuses.enabled {
                    return None;
                }

                match time_delta {
                    None => Some(CollectStatuses {
                        cron_jobs: cron_tab.cron_jobs,
                        timestamp: status.timestamp,
                        statuses: status.statuses.clone(),
                    }),
                    Some(time_delta) => {
                        let now = time();

                        if status.timestamp < now - *time_delta {
                            return None;
                        }

                        Some(CollectStatuses {
                            cron_jobs: cron_tab.cron_jobs,
                            timestamp: status.timestamp,
                            statuses: status.statuses.clone(),
                        })
                    }
                }
            }
        }
    }

    statuses
        .into_iter()
        .filter_map(|status| list_statuses(&status, args))
        .collect()
}

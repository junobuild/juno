use crate::store::{get_cron_tab, list_last_statuses};
use crate::types::interface::ListStatuses;
use crate::types::list::ListLastStatuses;

pub fn last_statuses() -> Vec<ListStatuses> {
    let statuses = list_last_statuses();

    fn list_statuses(status: &ListLastStatuses) -> Option<ListStatuses> {
        let cron_tab = get_cron_tab(&status.user);

        match cron_tab {
            None => None,
            Some(cron_tab) => {
                if !cron_tab.cron_jobs.statuses.enabled {
                    return None;
                }

                Some(ListStatuses {
                    cron_jobs: cron_tab.cron_jobs,
                    timestamp: status.timestamp,
                    statuses: status.statuses.clone(),
                })
            }
        }
    }

    statuses
        .into_iter()
        .filter_map(|status| list_statuses(&status))
        .collect()
}

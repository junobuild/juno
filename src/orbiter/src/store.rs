use crate::memory::STATE;
use crate::types::interface::{GetPageViews, SetPageView};
use crate::types::state::{AnalyticKey, PageView, PageViewsStable};
use ic_cdk::api::time;
use shared::utils::principal_equal;

pub fn insert_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    STATE.with(|state| {
        insert_page_view_impl(key, page_view, &mut state.borrow_mut().stable.page_views)
    })
}

fn insert_page_view_impl(
    key: AnalyticKey,
    page_view: SetPageView,
    db: &mut PageViewsStable,
) -> Result<PageView, String> {
    let current_page_view = db.get(&key);

    // There is no timestamp assertion in the case of the Orbiter analytics.
    // It's possible that the user refreshes the browser quickly, and as a result, the JS worker may send the same page again.
    // To improve performance, we want to avoid forcing the worker to fetch entities again in such cases.

    let now = time();

    let created_at: u64 = match current_page_view {
        None => now,
        Some(current_page_view) => current_page_view.created_at,
    };

    let new_page_view: PageView = PageView {
        title: page_view.title,
        href: page_view.href,
        referrer: page_view.referrer,
        device: page_view.device,
        user_agent: page_view.user_agent,
        time_zone: page_view.time_zone,
        collected_at: page_view.collected_at,
        created_at,
        updated_at: now,
    };

    db.insert(key.clone(), new_page_view.clone());

    Ok(new_page_view.clone())
}

pub fn get_page_views(filter: GetPageViews) -> Vec<(AnalyticKey, PageView)> {
    STATE.with(|state| get_page_views_impl(filter, &state.borrow_mut().stable.page_views))
}
fn get_page_views_impl(
    GetPageViews {
        from,
        to,
        satellite_id,
    }: GetPageViews,
    db: &PageViewsStable,
) -> Vec<(AnalyticKey, PageView)> {
    db.iter()
        .filter(|(key, page_view)| {
            let valid_key = match satellite_id {
                None => true,
                Some(satellite_id) => principal_equal(key.satellite_id, satellite_id),
            };

            let valid_from = match from {
                None => true,
                Some(from) => page_view.collected_at >= from
            };

            let valid_to = match to {
                None => true,
                Some(to) => page_view.collected_at <= to
            };

            valid_key && valid_from && valid_to
        })
        .collect()
}

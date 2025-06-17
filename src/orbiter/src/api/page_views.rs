use crate::analytics::{
    analytics_page_views_clients, analytics_page_views_metrics, analytics_page_views_top_10,
};
use crate::events::helpers::assert_and_insert_page_view;
use crate::events::store::get_page_views as get_page_views_store;
use crate::guards::caller_is_controller;
use crate::state::types::state::{AnalyticKey, PageView};
use crate::types::interface::{
    AnalyticsClientsPageViews, AnalyticsMetricsPageViews, AnalyticsTop10PageViews, GetAnalytics,
    SetPageView,
};
use ic_cdk_macros::{query, update};

#[update(guard = "caller_is_controller")]
fn set_page_view(key: AnalyticKey, page_view: SetPageView) -> Result<PageView, String> {
    assert_and_insert_page_view(key, page_view)
}

#[update(guard = "caller_is_controller")]
fn set_page_views(
    page_views: Vec<(AnalyticKey, SetPageView)>,
) -> Result<(), Vec<(AnalyticKey, String)>> {
    fn insert(key: AnalyticKey, page_view: SetPageView) -> Result<(), String> {
        assert_and_insert_page_view(key, page_view)?;

        Ok(())
    }

    let mut errors: Vec<(AnalyticKey, String)> = Vec::new();

    for (key, page_view) in page_views {
        let result = insert(key.clone(), page_view);

        match result {
            Ok(_) => {}
            Err(err) => errors.push((key, err)),
        }
    }

    if !errors.is_empty() {
        return Err(errors);
    }

    Ok(())
}

#[query(guard = "caller_is_controller")]
fn get_page_views(filter: GetAnalytics) -> Vec<(AnalyticKey, PageView)> {
    get_page_views_store(&filter)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_metrics(filter: GetAnalytics) -> AnalyticsMetricsPageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_metrics(&page_views)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_top_10(filter: GetAnalytics) -> AnalyticsTop10PageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_top_10(&page_views)
}

#[query(guard = "caller_is_controller")]
fn get_page_views_analytics_clients(filter: GetAnalytics) -> AnalyticsClientsPageViews {
    let page_views = get_page_views_store(&filter);
    analytics_page_views_clients(&page_views)
}

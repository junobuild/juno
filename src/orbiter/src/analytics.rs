use std::collections::{HashMap, HashSet};
use shared::day::{calendar_date};
use shared::types::utils::CalendarDate;
use crate::types::interface::AnalyticsPageViews;
use crate::types::state::{AnalyticKey, PageView};

pub fn page_views_analytics(page_views: &Vec<(AnalyticKey, PageView)>) -> AnalyticsPageViews {
    let mut daily_total_page_views: HashMap<CalendarDate, u32> = HashMap::new();
    let mut unique_sessions = HashSet::new();
    let mut sessions_views = HashMap::new();
    let mut sessions_unique_views: HashMap<String, HashSet<&String>> = HashMap::new();

    for (AnalyticKey {collected_at, key: _}, PageView {session_id, href, ..}) in page_views {
        let key = calendar_date(collected_at);

        let count = daily_total_page_views.entry(key).or_insert(0);
        *count += 1;

        unique_sessions.insert(session_id.clone());
        *sessions_views.entry(session_id.clone()).or_insert(0) += 1;
        sessions_unique_views.entry(session_id.clone()).or_default().insert(&href);
    }

    let unique_sessions_count = unique_sessions.len();
    let unique_page_views: usize = sessions_unique_views.values().map(|set| set.len()).sum();

    let total_page_views: u32 = daily_total_page_views.values().sum();
    let average_page_views_per_session = if unique_sessions_count > 0 {
        total_page_views as f64 / unique_sessions_count as f64
    } else {
        0.0
    };

    let single_page_view_sessions = sessions_views.values().filter(|&&count| count == 1).count();
    let total_sessions = sessions_views.len();

    let bounce_rate = if total_sessions > 0 {
        single_page_view_sessions as f64 / total_sessions as f64
    } else {
        0.0
    };

    AnalyticsPageViews {
        daily_total_page_views,
        unique_sessions: unique_sessions_count,
        unique_page_views,
        total_page_views,
        average_page_views_per_session,
        bounce_rate,
    }
}
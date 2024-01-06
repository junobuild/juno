use crate::types::interface::{AnalyticsPageViews, AnalyticsPageViewsMetrics};
use crate::types::state::{AnalyticKey, PageView};
use shared::day::calendar_date;
use shared::types::utils::CalendarDate;
use std::collections::{HashMap, HashSet};
use url::Url;

pub fn page_views_analytics(page_views: &Vec<(AnalyticKey, PageView)>) -> AnalyticsPageViews {
    let mut daily_total_page_views: HashMap<CalendarDate, u32> = HashMap::new();
    let mut unique_sessions = HashSet::new();
    let mut sessions_views = HashMap::new();
    let mut sessions_unique_views: HashMap<String, HashSet<&String>> = HashMap::new();

    let mut referrers: HashMap<String, u32> = HashMap::new();

    for (
        AnalyticKey {
            collected_at,
            key: _,
        },
        PageView {
            session_id,
            href,
            referrer,
            ..
        },
    ) in page_views
    {
        // Metrics
        let key = calendar_date(collected_at);

        let count = daily_total_page_views.entry(key).or_insert(0);
        *count += 1;

        unique_sessions.insert(session_id.clone());
        *sessions_views.entry(session_id.clone()).or_insert(0) += 1;
        sessions_unique_views
            .entry(session_id.clone())
            .or_default()
            .insert(&href);

        // Top 10 referrers
        let referrer = referrer.as_ref().unwrap();
        let host = match Url::parse(referrer) {
            Ok(parsed_url) => parsed_url.host_str().unwrap_or(referrer).to_string(),
            Err(_) => referrer.to_string(),
        };

        *referrers.entry(host.to_string()).or_insert(0) += 1;
    }

    // Metrics

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

    // Top 10 referrers
    let mut entries: Vec<(String, u32)> = referrers.into_iter().collect();
    entries.sort_by(|a, b| b.1.cmp(&a.1));
    let top_referrers = entries.into_iter().take(10).collect::<Vec<(String, u32)>>();

    AnalyticsPageViews {
        metrics: AnalyticsPageViewsMetrics {
            daily_total_page_views,
            unique_sessions: unique_sessions_count,
            unique_page_views,
            total_page_views,
            average_page_views_per_session,
            bounce_rate,
        },
        top_referrers,
    }
}

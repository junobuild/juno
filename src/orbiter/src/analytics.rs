use crate::types::interface::{
    AnalyticsDevicesPageViews, AnalyticsMetricsPageViews, AnalyticsTop10PageViews,
};
use crate::types::state::{AnalyticKey, PageView};
use ic_cdk::api::instruction_counter;
use regex::Regex;
use shared::day::calendar_date;
use shared::types::utils::CalendarDate;
use std::collections::{HashMap, HashSet};
use url::Url;

struct Devices {
    mobile: u32,
    desktop: u32,
    others: u32,
}

struct DevicesRegex {
    mobile: Regex,
    android: Regex,
    iphone: Regex,
}

pub fn analytics_metrics_page_views(
    page_views: &Vec<(AnalyticKey, PageView)>,
) -> AnalyticsMetricsPageViews {
    let mut daily_total_page_views: HashMap<CalendarDate, u32> = HashMap::new();
    let mut unique_sessions = HashSet::new();
    let mut sessions_views = HashMap::new();
    let mut sessions_unique_views: HashMap<String, HashSet<String>> = HashMap::new();

    for (
        AnalyticKey {
            collected_at,
            key: _,
        },
        PageView {
            session_id, href, ..
        },
    ) in page_views
    {
        analytics_metrics(
            collected_at,
            session_id,
            href,
            &mut daily_total_page_views,
            &mut unique_sessions,
            &mut sessions_views,
            &mut sessions_unique_views,
        );
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

    AnalyticsMetricsPageViews {
        daily_total_page_views,
        unique_sessions: unique_sessions_count,
        unique_page_views,
        total_page_views,
        average_page_views_per_session,
        bounce_rate,
        instructions: instruction_counter(),
    }
}

pub fn analytics_top_10_page_views(
    page_views: &Vec<(AnalyticKey, PageView)>,
) -> AnalyticsTop10PageViews {
    let mut referrers: HashMap<String, u32> = HashMap::new();
    let mut pages: HashMap<String, u32> = HashMap::new();

    for (_, PageView { referrer, href, .. }) in page_views {
        analytics_referrers(referrer, &mut referrers);
        analytics_pages(href, &mut pages);
    }

    fn top_10(data: HashMap<String, u32>) -> Vec<(String, u32)> {
        let mut entries: Vec<(String, u32)> = data.into_iter().collect();
        entries.sort_by(|a, b| b.1.cmp(&a.1));
        entries.into_iter().take(10).collect()
    }

    AnalyticsTop10PageViews {
        referrers: top_10(referrers),
        pages: top_10(pages),
        instructions: instruction_counter(),
    }
}

pub fn analytics_devices_page_views(
    page_views: &Vec<(AnalyticKey, PageView)>,
) -> AnalyticsDevicesPageViews {
    let mut total_devices = Devices {
        mobile: 0,
        desktop: 0,
        others: 0,
    };

    let devices_regex: DevicesRegex = DevicesRegex {
        mobile: Regex::new(r"mobile").unwrap(),
        android: Regex::new(r"android|sink").unwrap(),
        iphone: Regex::new(r"iPhone|iPod").unwrap(),
    };

    for (_, PageView { user_agent, .. }) in page_views {
        analytics_devices(user_agent, &devices_regex, &mut total_devices);
    }

    let total = page_views.len();

    AnalyticsDevicesPageViews {
        desktop: if total > 0 {
            total_devices.desktop as f64 / total as f64
        } else {
            0.0
        },
        mobile: if total > 0 {
            total_devices.mobile as f64 / total as f64
        } else {
            0.0
        },
        others: if total > 0 {
            total_devices.others as f64 / total as f64
        } else {
            0.0
        },
        instructions: instruction_counter(),
    }
}

fn analytics_metrics(
    collected_at: &u64,
    session_id: &str,
    href: &str,
    daily_total_page_views: &mut HashMap<CalendarDate, u32>,
    unique_sessions: &mut HashSet<String>,
    sessions_views: &mut HashMap<String, u32>,
    sessions_unique_views: &mut HashMap<String, HashSet<String>>,
) {
    let key = calendar_date(collected_at);

    let count = daily_total_page_views.entry(key).or_insert(0);
    *count += 1;

    unique_sessions.insert(session_id.to_owned());
    *sessions_views.entry(session_id.to_owned()).or_insert(0) += 1;
    sessions_unique_views
        .entry(session_id.to_owned())
        .or_default()
        .insert(href.to_owned());
}

fn analytics_referrers(referrer: &Option<String>, referrers: &mut HashMap<String, u32>) {
    match referrer {
        None => (),
        Some(referrer) => {
            let host = match Url::parse(referrer) {
                Ok(parsed_url) => parsed_url.host_str().unwrap_or(referrer).to_string(),
                Err(_) => referrer.to_string(),
            };

            *referrers.entry(host.to_string()).or_insert(0) += 1;
        }
    }
}

fn analytics_pages(href: &str, pages: &mut HashMap<String, u32>) {
    let page = match Url::parse(href) {
        Ok(parsed_url) => parsed_url.path().to_string(),
        Err(_) => href.to_string(),
    };
    *pages.entry(page).or_insert(0) += 1;
}

fn analytics_devices(
    user_agent: &Option<String>,
    devices_regex: &DevicesRegex,
    devices: &mut Devices,
) {
    match user_agent {
        Some(ua)
            if devices_regex.iphone.is_match(ua)
                || (devices_regex.android.is_match(ua) && !devices_regex.mobile.is_match(ua)) =>
        {
            devices.mobile += 1;
        }
        Some(_) => {
            devices.desktop += 1;
        }
        None => {
            devices.others += 1;
        }
    }
}

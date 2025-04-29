use crate::state::types::state::{
    AnalyticKey, PageView, PerformanceData, PerformanceMetric, PerformanceMetricName, TrackEvent,
    WebVitalsMetric,
};
use crate::types::interface::{
    AnalyticsBrowsersPageViews, AnalyticsClientsPageViews, AnalyticsDevicesPageViews,
    AnalyticsMetricsPageViews, AnalyticsTop10PageViews, AnalyticsTrackEvents,
    AnalyticsWebVitalsPageMetrics, AnalyticsWebVitalsPerformanceMetrics,
};
use junobuild_shared::day::calendar_date;
use junobuild_shared::types::utils::CalendarDate;
use regex::Regex;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use url::Url;

struct Devices {
    mobile: u32,
    desktop: u32,
    others: u32,
}

struct Browsers {
    chrome: u32,
    opera: u32,
    firefox: u32,
    safari: u32,
    others: u32,
}

struct DevicesRegex {
    mobile: Regex,
    android: Regex,
    iphone: Regex,
}

struct BrowsersRegex {
    chrome: Regex,
    opera: Regex,
    firefox: Regex,
    safari: Regex,
}

pub fn analytics_page_views_metrics(
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
        total_sessions: Some(total_sessions),
        unique_sessions: unique_sessions_count,
        unique_page_views,
        total_page_views,
        average_page_views_per_session,
        bounce_rate,
    }
}

pub fn analytics_page_views_top_10(
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
    }
}

pub fn analytics_page_views_clients(
    page_views: &Vec<(AnalyticKey, PageView)>,
) -> AnalyticsClientsPageViews {
    let mut total_devices = Devices {
        mobile: 0,
        desktop: 0,
        others: 0,
    };

    let mut total_browsers = Browsers {
        chrome: 0,
        opera: 0,
        firefox: 0,
        safari: 0,
        others: 0,
    };

    let devices_regex: DevicesRegex = DevicesRegex {
        mobile: Regex::new(r"(?i)mobile").unwrap(),
        android: Regex::new(r"(?i)android|sink").unwrap(),
        iphone: Regex::new(r"(?i)iPhone|iPod").unwrap(),
    };

    let browsers_regex: BrowsersRegex = BrowsersRegex {
        chrome: Regex::new(r"(?i)chrome|chromium|crios").unwrap(),
        opera: Regex::new(r"(?i)opera|opr").unwrap(),
        firefox: Regex::new(r"(?i)firefox|fxios").unwrap(),
        safari: Regex::new(r"(?i)safari").unwrap(),
    };

    for (_, PageView { user_agent, .. }) in page_views {
        analytics_devices(user_agent, &devices_regex, &mut total_devices);
        analytics_browsers(user_agent, &browsers_regex, &mut total_browsers);
    }

    let total = page_views.len();

    let devices = AnalyticsDevicesPageViews {
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
    };

    let browsers = AnalyticsBrowsersPageViews {
        chrome: if total > 0 {
            total_browsers.chrome as f64 / total as f64
        } else {
            0.0
        },
        opera: if total > 0 {
            total_browsers.opera as f64 / total as f64
        } else {
            0.0
        },
        firefox: if total > 0 {
            total_browsers.firefox as f64 / total as f64
        } else {
            0.0
        },
        safari: if total > 0 {
            total_browsers.safari as f64 / total as f64
        } else {
            0.0
        },
        others: if total > 0 {
            total_devices.others as f64 / total as f64
        } else {
            0.0
        },
    };

    AnalyticsClientsPageViews { devices, browsers }
}

pub fn analytics_track_events(
    track_events: &Vec<(AnalyticKey, TrackEvent)>,
) -> AnalyticsTrackEvents {
    let mut total_track_events: HashMap<String, u32> = HashMap::new();

    for (_, TrackEvent { name, .. }) in track_events {
        let count = total_track_events.entry(name.clone()).or_insert(0);
        *count += 1;
    }

    AnalyticsTrackEvents {
        total: total_track_events,
    }
}

#[derive(Default)]
struct PerformanceMetricAccumulator {
    sum: f64,
    count: u32,
}

impl PerformanceMetricAccumulator {
    fn add(&mut self, value: &f64) {
        self.sum += value;
        self.count += 1;
    }

    fn average(&self) -> Option<f64> {
        if self.count > 0 {
            Some(self.sum / self.count as f64)
        } else {
            None
        }
    }
}

pub fn analytics_performance_metrics_web_vitals(
    metrics: &Vec<(AnalyticKey, PerformanceMetric)>,
) -> AnalyticsWebVitalsPerformanceMetrics {
    let mut overall_cls_acc = PerformanceMetricAccumulator::default();
    let mut overall_fcp_acc = PerformanceMetricAccumulator::default();
    let mut overall_inp_acc = PerformanceMetricAccumulator::default();
    let mut overall_lcp_acc = PerformanceMetricAccumulator::default();
    let mut overall_ttfb_acc = PerformanceMetricAccumulator::default();

    let mut page_metrics: HashMap<
        String,
        (
            PerformanceMetricAccumulator,
            PerformanceMetricAccumulator,
            PerformanceMetricAccumulator,
            PerformanceMetricAccumulator,
            PerformanceMetricAccumulator,
        ),
    > = HashMap::new();

    for (
        _,
        PerformanceMetric {
            data,
            metric_name,
            href,
            ..
        },
    ) in metrics
    {
        #[allow(irrefutable_let_patterns)]
        if let PerformanceData::WebVitalsMetric(WebVitalsMetric { value, .. }) = &data {
            let page = match Url::parse(href) {
                Ok(parsed_url) => parsed_url.path().to_string(),
                Err(_) => href.clone(),
            };

            let entry = page_metrics.entry(page).or_insert_with(|| {
                (
                    PerformanceMetricAccumulator::default(),
                    PerformanceMetricAccumulator::default(),
                    PerformanceMetricAccumulator::default(),
                    PerformanceMetricAccumulator::default(),
                    PerformanceMetricAccumulator::default(),
                )
            });

            let (cls_acc, fcp_acc, inp_acc, lcp_acc, ttfb_acc) = entry;

            match metric_name {
                PerformanceMetricName::CLS => {
                    cls_acc.add(value);
                    overall_cls_acc.add(value);
                }
                PerformanceMetricName::FCP => {
                    fcp_acc.add(value);
                    overall_fcp_acc.add(value);
                }
                PerformanceMetricName::INP => {
                    inp_acc.add(value);
                    overall_inp_acc.add(value);
                }
                PerformanceMetricName::LCP => {
                    lcp_acc.add(value);
                    overall_lcp_acc.add(value);
                }
                PerformanceMetricName::TTFB => {
                    ttfb_acc.add(value);
                    overall_ttfb_acc.add(value);
                }
            }
        }
    }

    let overall_metrics = AnalyticsWebVitalsPageMetrics {
        cls: overall_cls_acc.average(),
        fcp: overall_fcp_acc.average(),
        inp: overall_inp_acc.average(),
        lcp: overall_lcp_acc.average(),
        ttfb: overall_ttfb_acc.average(),
    };

    let mut page_metrics: Vec<(String, AnalyticsWebVitalsPageMetrics)> = page_metrics
        .into_iter()
        .map(|(page, (cls_acc, fcp_acc, inp_acc, lcp_acc, ttfb_acc))| {
            (
                page,
                AnalyticsWebVitalsPageMetrics {
                    cls: cls_acc.average(),
                    fcp: fcp_acc.average(),
                    inp: inp_acc.average(),
                    lcp: lcp_acc.average(),
                    ttfb: ttfb_acc.average(),
                },
            )
        })
        .collect();

    page_metrics.sort_by(|(page_a, _), (page_b, _)| {
        if page_a == "/" {
            Ordering::Less
        } else if page_b == "/" {
            Ordering::Greater
        } else {
            page_a.cmp(page_b)
        }
    });

    AnalyticsWebVitalsPerformanceMetrics {
        overall: overall_metrics,
        pages: page_metrics,
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
    if let Some(ua) = user_agent {
        if devices_regex.iphone.is_match(ua)
            || (devices_regex.android.is_match(ua) && !devices_regex.mobile.is_match(ua))
        {
            devices.mobile += 1;
        } else {
            devices.desktop += 1;
        }
    } else {
        devices.others += 1;
    }
}

fn analytics_browsers(
    user_agent: &Option<String>,
    browsers_regex: &BrowsersRegex,
    browsers: &mut Browsers,
) {
    if let Some(ua) = user_agent {
        if browsers_regex.chrome.is_match(ua) {
            browsers.chrome += 1;
        } else if browsers_regex.opera.is_match(ua) {
            browsers.opera += 1;
        } else if browsers_regex.firefox.is_match(ua) {
            browsers.firefox += 1;
        } else if browsers_regex.safari.is_match(ua) {
            browsers.safari += 1;
        } else {
            browsers.others += 1;
        }
    } else {
        browsers.others += 1;
    }
}

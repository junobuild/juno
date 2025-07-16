#![deny(clippy::disallowed_methods)]

mod analytics;
mod api;
mod assert;
mod config;
mod constants;
mod controllers;
mod events;
mod guards;
mod handler;
mod http;
mod msg;
mod serializers;
mod state;
mod types;

use crate::state::types::state::AnalyticKey;
use crate::state::types::state::PageView;
use crate::state::types::state::PerformanceMetric;
use crate::state::types::state::SatelliteConfigs;
use crate::state::types::state::TrackEvent;
use crate::types::interface::AnalyticsClientsPageViews;
use crate::types::interface::AnalyticsMetricsPageViews;
use crate::types::interface::AnalyticsTop10PageViews;
use crate::types::interface::AnalyticsTrackEvents;
use crate::types::interface::AnalyticsWebVitalsPerformanceMetrics;
use crate::types::interface::DelSatelliteConfig;
use crate::types::interface::GetAnalytics;
use crate::types::interface::SetPageView;
use crate::types::interface::SetPerformanceMetric;
use crate::types::interface::SetSatelliteConfig;
use crate::types::interface::SetTrackEvent;
use ic_cdk_macros::export_candid;
use ic_http_certification::HttpRequest;
use ic_http_certification::HttpResponse;
use junobuild_shared::types::interface::MemorySize;
use junobuild_shared::types::interface::{
    DeleteControllersArgs, DepositCyclesArgs, SetControllersArgs,
};
use junobuild_shared::types::state::{Controllers, SatelliteId};

export_candid!();

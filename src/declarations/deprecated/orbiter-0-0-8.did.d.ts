import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface AnalyticKey {
	key: string;
	collected_at: bigint;
}
export interface AnalyticsBrowsersPageViews {
	safari: number;
	opera: number;
	others: number;
	firefox: number;
	chrome: number;
}
export interface AnalyticsClientsPageViews {
	browsers: AnalyticsBrowsersPageViews;
	devices: AnalyticsDevicesPageViews;
}
export interface AnalyticsDevicesPageViews {
	desktop: number;
	others: number;
	mobile: number;
}
export interface AnalyticsMetricsPageViews {
	bounce_rate: number;
	average_page_views_per_session: number;
	daily_total_page_views: Array<[CalendarDate, number]>;
	total_page_views: number;
	unique_page_views: bigint;
	unique_sessions: bigint;
}
export interface AnalyticsTop10PageViews {
	referrers: Array<[string, number]>;
	pages: Array<[string, number]>;
}
export interface AnalyticsTrackEvents {
	total: Array<[string, number]>;
}
export interface AnalyticsWebVitalsPageMetrics {
	cls: [] | [number];
	fcp: [] | [number];
	inp: [] | [number];
	lcp: [] | [number];
	ttfb: [] | [number];
}
export interface AnalyticsWebVitalsPerformanceMetrics {
	overall: AnalyticsWebVitalsPageMetrics;
	pages: Array<[string, AnalyticsWebVitalsPageMetrics]>;
}
export interface CalendarDate {
	day: number;
	month: number;
	year: number;
}
export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface DelSatelliteConfig {
	version: [] | [bigint];
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface DepositCyclesArgs {
	cycles: bigint;
	destination_id: Principal;
}
export interface GetAnalytics {
	to: [] | [bigint];
	from: [] | [bigint];
	satellite_id: [] | [Principal];
}
export interface MemorySize {
	stable: bigint;
	heap: bigint;
}
export type NavigationType =
	| { Navigate: null }
	| { Restore: null }
	| { Reload: null }
	| { BackForward: null }
	| { BackForwardCache: null }
	| { Prerender: null };
export interface OrbiterSatelliteConfig {
	updated_at: bigint;
	created_at: bigint;
	version: [] | [bigint];
	enabled: boolean;
}
export interface PageView {
	title: string;
	updated_at: bigint;
	referrer: [] | [string];
	time_zone: string;
	session_id: string;
	href: string;
	created_at: bigint;
	satellite_id: Principal;
	device: PageViewDevice;
	version: [] | [bigint];
	user_agent: [] | [string];
}
export interface PageViewDevice {
	inner_height: number;
	inner_width: number;
}
export type PerformanceData = { WebVitalsMetric: WebVitalsMetric };
export interface PerformanceMetric {
	updated_at: bigint;
	session_id: string;
	data: PerformanceData;
	href: string;
	metric_name: PerformanceMetricName;
	created_at: bigint;
	satellite_id: Principal;
	version: [] | [bigint];
}
export type PerformanceMetricName =
	| { CLS: null }
	| { FCP: null }
	| { INP: null }
	| { LCP: null }
	| { TTFB: null };
export type Result = { Ok: PageView } | { Err: string };
export type Result_1 = { Ok: null } | { Err: Array<[AnalyticKey, string]> };
export type Result_2 = { Ok: PerformanceMetric } | { Err: string };
export type Result_3 = { Ok: TrackEvent } | { Err: string };
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface SetPageView {
	title: string;
	updated_at: [] | [bigint];
	referrer: [] | [string];
	time_zone: string;
	session_id: string;
	href: string;
	satellite_id: Principal;
	device: PageViewDevice;
	version: [] | [bigint];
	user_agent: [] | [string];
}
export interface SetPerformanceMetric {
	session_id: string;
	data: PerformanceData;
	href: string;
	metric_name: PerformanceMetricName;
	satellite_id: Principal;
	version: [] | [bigint];
	user_agent: [] | [string];
}
export interface SetSatelliteConfig {
	version: [] | [bigint];
	enabled: boolean;
}
export interface SetTrackEvent {
	updated_at: [] | [bigint];
	session_id: string;
	metadata: [] | [Array<[string, string]>];
	name: string;
	satellite_id: Principal;
	version: [] | [bigint];
	user_agent: [] | [string];
}
export interface TrackEvent {
	updated_at: bigint;
	session_id: string;
	metadata: [] | [Array<[string, string]>];
	name: string;
	created_at: bigint;
	satellite_id: Principal;
	version: [] | [bigint];
}
export interface WebVitalsMetric {
	id: string;
	value: number;
	navigation_type: [] | [NavigationType];
	delta: number;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], Array<[Principal, Controller]>>;
	del_satellite_config: ActorMethod<[Principal, DelSatelliteConfig], undefined>;
	deposit_cycles: ActorMethod<[DepositCyclesArgs], undefined>;
	get_page_views: ActorMethod<[GetAnalytics], Array<[AnalyticKey, PageView]>>;
	get_page_views_analytics_clients: ActorMethod<[GetAnalytics], AnalyticsClientsPageViews>;
	get_page_views_analytics_metrics: ActorMethod<[GetAnalytics], AnalyticsMetricsPageViews>;
	get_page_views_analytics_top_10: ActorMethod<[GetAnalytics], AnalyticsTop10PageViews>;
	get_performance_metrics: ActorMethod<[GetAnalytics], Array<[AnalyticKey, PerformanceMetric]>>;
	get_performance_metrics_analytics_web_vitals: ActorMethod<
		[GetAnalytics],
		AnalyticsWebVitalsPerformanceMetrics
	>;
	get_track_events: ActorMethod<[GetAnalytics], Array<[AnalyticKey, TrackEvent]>>;
	get_track_events_analytics: ActorMethod<[GetAnalytics], AnalyticsTrackEvents>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_satellite_configs: ActorMethod<[], Array<[Principal, OrbiterSatelliteConfig]>>;
	memory_size: ActorMethod<[], MemorySize>;
	set_controllers: ActorMethod<[SetControllersArgs], Array<[Principal, Controller]>>;
	set_page_view: ActorMethod<[AnalyticKey, SetPageView], Result>;
	set_page_views: ActorMethod<[Array<[AnalyticKey, SetPageView]>], Result_1>;
	set_performance_metric: ActorMethod<[AnalyticKey, SetPerformanceMetric], Result_2>;
	set_performance_metrics: ActorMethod<[Array<[AnalyticKey, SetPerformanceMetric]>], Result_1>;
	set_satellite_configs: ActorMethod<
		[Array<[Principal, SetSatelliteConfig]>],
		Array<[Principal, OrbiterSatelliteConfig]>
	>;
	set_track_event: ActorMethod<[AnalyticKey, SetTrackEvent], Result_3>;
	set_track_events: ActorMethod<[Array<[AnalyticKey, SetTrackEvent]>], Result_1>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

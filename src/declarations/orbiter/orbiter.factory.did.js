// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null
	});
	const Controller = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const DelSatelliteConfig = IDL.Record({ version: IDL.Opt(IDL.Nat64) });
	const DepositCyclesArgs = IDL.Record({
		cycles: IDL.Nat,
		destination_id: IDL.Principal
	});
	const GetAnalytics = IDL.Record({
		to: IDL.Opt(IDL.Nat64),
		from: IDL.Opt(IDL.Nat64),
		satellite_id: IDL.Opt(IDL.Principal)
	});
	const AnalyticKey = IDL.Record({
		key: IDL.Text,
		collected_at: IDL.Nat64
	});
	const PageViewClient = IDL.Record({
		os: IDL.Text,
		device: IDL.Opt(IDL.Text),
		browser: IDL.Text
	});
	const PageViewDevice = IDL.Record({
		inner_height: IDL.Nat16,
		screen_height: IDL.Opt(IDL.Nat16),
		screen_width: IDL.Opt(IDL.Nat16),
		inner_width: IDL.Nat16
	});
	const PageView = IDL.Record({
		client: IDL.Opt(PageViewClient),
		title: IDL.Text,
		updated_at: IDL.Nat64,
		referrer: IDL.Opt(IDL.Text),
		time_zone: IDL.Text,
		session_id: IDL.Text,
		href: IDL.Text,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal,
		device: PageViewDevice,
		version: IDL.Opt(IDL.Nat64),
		user_agent: IDL.Opt(IDL.Text)
	});
	const AnalyticsBrowsersPageViews = IDL.Record({
		safari: IDL.Float64,
		opera: IDL.Float64,
		others: IDL.Float64,
		firefox: IDL.Float64,
		chrome: IDL.Float64
	});
	const AnalyticsOperatingSystemsPageViews = IDL.Record({
		ios: IDL.Float64,
		macos: IDL.Float64,
		others: IDL.Float64,
		linux: IDL.Float64,
		android: IDL.Float64,
		windows: IDL.Float64
	});
	const AnalyticsDevicesPageViews = IDL.Record({
		desktop: IDL.Float64,
		laptop: IDL.Opt(IDL.Float64),
		others: IDL.Float64,
		tablet: IDL.Opt(IDL.Float64),
		mobile: IDL.Float64
	});
	const AnalyticsClientsPageViews = IDL.Record({
		browsers: AnalyticsBrowsersPageViews,
		operating_systems: IDL.Opt(AnalyticsOperatingSystemsPageViews),
		devices: AnalyticsDevicesPageViews
	});
	const CalendarDate = IDL.Record({
		day: IDL.Nat8,
		month: IDL.Nat8,
		year: IDL.Int32
	});
	const AnalyticsMetricsPageViews = IDL.Record({
		bounce_rate: IDL.Float64,
		average_page_views_per_session: IDL.Float64,
		daily_total_page_views: IDL.Vec(IDL.Tuple(CalendarDate, IDL.Nat32)),
		total_page_views: IDL.Nat32,
		unique_page_views: IDL.Nat64,
		unique_sessions: IDL.Nat64
	});
	const AnalyticsTop10PageViews = IDL.Record({
		referrers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32)),
		pages: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32)),
		time_zones: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32)))
	});
	const NavigationType = IDL.Variant({
		Navigate: IDL.Null,
		Restore: IDL.Null,
		Reload: IDL.Null,
		BackForward: IDL.Null,
		BackForwardCache: IDL.Null,
		Prerender: IDL.Null
	});
	const WebVitalsMetric = IDL.Record({
		id: IDL.Text,
		value: IDL.Float64,
		navigation_type: IDL.Opt(NavigationType),
		delta: IDL.Float64
	});
	const PerformanceData = IDL.Variant({ WebVitalsMetric: WebVitalsMetric });
	const PerformanceMetricName = IDL.Variant({
		CLS: IDL.Null,
		FCP: IDL.Null,
		INP: IDL.Null,
		LCP: IDL.Null,
		TTFB: IDL.Null
	});
	const PerformanceMetric = IDL.Record({
		updated_at: IDL.Nat64,
		session_id: IDL.Text,
		data: PerformanceData,
		href: IDL.Text,
		metric_name: PerformanceMetricName,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal,
		version: IDL.Opt(IDL.Nat64)
	});
	const AnalyticsWebVitalsPageMetrics = IDL.Record({
		cls: IDL.Opt(IDL.Float64),
		fcp: IDL.Opt(IDL.Float64),
		inp: IDL.Opt(IDL.Float64),
		lcp: IDL.Opt(IDL.Float64),
		ttfb: IDL.Opt(IDL.Float64)
	});
	const AnalyticsWebVitalsPerformanceMetrics = IDL.Record({
		overall: AnalyticsWebVitalsPageMetrics,
		pages: IDL.Vec(IDL.Tuple(IDL.Text, AnalyticsWebVitalsPageMetrics))
	});
	const TrackEvent = IDL.Record({
		updated_at: IDL.Nat64,
		session_id: IDL.Text,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		name: IDL.Text,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal,
		version: IDL.Opt(IDL.Nat64)
	});
	const AnalyticsTrackEvents = IDL.Record({
		total: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32))
	});
	const HttpRequest = IDL.Record({
		url: IDL.Text,
		method: IDL.Text,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		certificate_version: IDL.Opt(IDL.Nat16)
	});
	const HttpResponse = IDL.Record({
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		upgrade: IDL.Opt(IDL.Bool),
		status_code: IDL.Nat16
	});
	const OrbiterSatelliteFeatures = IDL.Record({
		performance_metrics: IDL.Bool,
		track_events: IDL.Bool,
		page_views: IDL.Bool
	});
	const OrbiterSatelliteConfig = IDL.Record({
		updated_at: IDL.Nat64,
		features: IDL.Opt(OrbiterSatelliteFeatures),
		restricted_origin: IDL.Opt(IDL.Text),
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64)
	});
	const SetController = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const SetControllersArgs = IDL.Record({
		controller: SetController,
		controllers: IDL.Vec(IDL.Principal)
	});
	const SetPageView = IDL.Record({
		client: IDL.Opt(PageViewClient),
		title: IDL.Text,
		updated_at: IDL.Opt(IDL.Nat64),
		referrer: IDL.Opt(IDL.Text),
		time_zone: IDL.Text,
		session_id: IDL.Text,
		href: IDL.Text,
		satellite_id: IDL.Principal,
		device: PageViewDevice,
		version: IDL.Opt(IDL.Nat64),
		user_agent: IDL.Opt(IDL.Text)
	});
	const Result = IDL.Variant({ Ok: PageView, Err: IDL.Text });
	const Result_1 = IDL.Variant({
		Ok: IDL.Null,
		Err: IDL.Vec(IDL.Tuple(AnalyticKey, IDL.Text))
	});
	const SetPerformanceMetric = IDL.Record({
		session_id: IDL.Text,
		data: PerformanceData,
		href: IDL.Text,
		metric_name: PerformanceMetricName,
		satellite_id: IDL.Principal,
		version: IDL.Opt(IDL.Nat64),
		user_agent: IDL.Opt(IDL.Text)
	});
	const Result_2 = IDL.Variant({ Ok: PerformanceMetric, Err: IDL.Text });
	const SetSatelliteConfig = IDL.Record({
		features: IDL.Opt(OrbiterSatelliteFeatures),
		restricted_origin: IDL.Opt(IDL.Text),
		version: IDL.Opt(IDL.Nat64)
	});
	const SetTrackEvent = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		session_id: IDL.Text,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		name: IDL.Text,
		satellite_id: IDL.Principal,
		version: IDL.Opt(IDL.Nat64),
		user_agent: IDL.Opt(IDL.Text)
	});
	const Result_3 = IDL.Variant({ Ok: TrackEvent, Err: IDL.Text });
	return IDL.Service({
		del_controllers: IDL.Func(
			[DeleteControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		del_satellite_config: IDL.Func([IDL.Principal, DelSatelliteConfig], [], []),
		deposit_cycles: IDL.Func([DepositCyclesArgs], [], []),
		get_page_views: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, PageView))],
			['query']
		),
		get_page_views_analytics_clients: IDL.Func(
			[GetAnalytics],
			[AnalyticsClientsPageViews],
			['query']
		),
		get_page_views_analytics_metrics: IDL.Func(
			[GetAnalytics],
			[AnalyticsMetricsPageViews],
			['query']
		),
		get_page_views_analytics_top_10: IDL.Func([GetAnalytics], [AnalyticsTop10PageViews], ['query']),
		get_performance_metrics: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, PerformanceMetric))],
			['query']
		),
		get_performance_metrics_analytics_web_vitals: IDL.Func(
			[GetAnalytics],
			[AnalyticsWebVitalsPerformanceMetrics],
			['query']
		),
		get_track_events: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, TrackEvent))],
			['query']
		),
		get_track_events_analytics: IDL.Func([GetAnalytics], [AnalyticsTrackEvents], ['query']),
		http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
		http_request_update: IDL.Func([HttpRequest], [HttpResponse], []),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_satellite_configs: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, OrbiterSatelliteConfig))],
			['query']
		),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_page_view: IDL.Func([AnalyticKey, SetPageView], [Result], []),
		set_page_views: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetPageView))], [Result_1], []),
		set_performance_metric: IDL.Func([AnalyticKey, SetPerformanceMetric], [Result_2], []),
		set_performance_metrics: IDL.Func(
			[IDL.Vec(IDL.Tuple(AnalyticKey, SetPerformanceMetric))],
			[Result_1],
			[]
		),
		set_satellite_configs: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Principal, SetSatelliteConfig))],
			[IDL.Vec(IDL.Tuple(IDL.Principal, OrbiterSatelliteConfig))],
			[]
		),
		set_track_event: IDL.Func([AnalyticKey, SetTrackEvent], [Result_3], []),
		set_track_events: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetTrackEvent))], [Result_1], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

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
	const DelSatelliteConfig = IDL.Record({ updated_at: IDL.Opt(IDL.Nat64) });
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
	const PageViewDevice = IDL.Record({
		inner_height: IDL.Nat16,
		inner_width: IDL.Nat16
	});
	const PageView = IDL.Record({
		title: IDL.Text,
		updated_at: IDL.Nat64,
		referrer: IDL.Opt(IDL.Text),
		time_zone: IDL.Text,
		session_id: IDL.Text,
		href: IDL.Text,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal,
		device: PageViewDevice,
		user_agent: IDL.Opt(IDL.Text)
	});
	const StoredPageView = IDL.Variant({
		Unbounded: PageView,
		Bounded: PageView
	});
	const AnalyticsBrowsersPageViews = IDL.Record({
		safari: IDL.Float64,
		opera: IDL.Float64,
		others: IDL.Float64,
		firefox: IDL.Float64,
		chrome: IDL.Float64
	});
	const AnalyticsDevicesPageViews = IDL.Record({
		desktop: IDL.Float64,
		others: IDL.Float64,
		mobile: IDL.Float64
	});
	const AnalyticsClientsPageViews = IDL.Record({
		browsers: AnalyticsBrowsersPageViews,
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
		pages: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32))
	});
	const TrackEvent = IDL.Record({
		updated_at: IDL.Nat64,
		session_id: IDL.Text,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		name: IDL.Text,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal
	});
	const StoredTrackEvent = IDL.Variant({
		Unbounded: TrackEvent,
		Bounded: TrackEvent
	});
	const AnalyticsTrackEvents = IDL.Record({
		total: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat32))
	});
	const OrbiterSatelliteConfig = IDL.Record({
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		enabled: IDL.Bool
	});
	const MemorySize = IDL.Record({ stable: IDL.Nat64, heap: IDL.Nat64 });
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
		title: IDL.Text,
		updated_at: IDL.Opt(IDL.Nat64),
		referrer: IDL.Opt(IDL.Text),
		time_zone: IDL.Text,
		session_id: IDL.Text,
		href: IDL.Text,
		satellite_id: IDL.Principal,
		device: PageViewDevice,
		user_agent: IDL.Opt(IDL.Text)
	});
	const Result = IDL.Variant({ Ok: PageView, Err: IDL.Text });
	const Result_1 = IDL.Variant({
		Ok: IDL.Null,
		Err: IDL.Vec(IDL.Tuple(AnalyticKey, IDL.Text))
	});
	const SetSatelliteConfig = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		enabled: IDL.Bool
	});
	const SetTrackEvent = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		session_id: IDL.Text,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		name: IDL.Text,
		satellite_id: IDL.Principal,
		user_agent: IDL.Opt(IDL.Text)
	});
	const Result_2 = IDL.Variant({ Ok: TrackEvent, Err: IDL.Text });
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
			[IDL.Vec(IDL.Tuple(AnalyticKey, StoredPageView))],
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
		get_track_events: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, StoredTrackEvent))],
			['query']
		),
		get_track_events_analytics: IDL.Func([GetAnalytics], [AnalyticsTrackEvents], ['query']),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_satellite_configs: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, OrbiterSatelliteConfig))],
			['query']
		),
		memory_size: IDL.Func([], [MemorySize], ['query']),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_page_view: IDL.Func([AnalyticKey, SetPageView], [Result], []),
		set_page_views: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetPageView))], [Result_1], []),
		set_satellite_configs: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Principal, SetSatelliteConfig))],
			[IDL.Vec(IDL.Tuple(IDL.Principal, OrbiterSatelliteConfig))],
			[]
		),
		set_track_event: IDL.Func([AnalyticKey, SetTrackEvent], [Result_2], []),
		set_track_events: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetTrackEvent))], [Result_1], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

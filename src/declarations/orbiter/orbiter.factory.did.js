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
	const TrackEvent = IDL.Record({
		updated_at: IDL.Nat64,
		session_id: IDL.Text,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		name: IDL.Text,
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal
	});
	const SatelliteConfig = IDL.Record({
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		enabled: IDL.Bool
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
		get_page_views: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, PageView))],
			['query']
		),
		get_track_events: IDL.Func(
			[GetAnalytics],
			[IDL.Vec(IDL.Tuple(AnalyticKey, TrackEvent))],
			['query']
		),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_satellite_configs: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, SatelliteConfig))],
			['query']
		),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_page_view: IDL.Func([AnalyticKey, SetPageView], [Result], []),
		set_page_views: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetPageView))], [Result_1], []),
		set_satellite_configs: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Principal, SetSatelliteConfig))],
			[IDL.Vec(IDL.Tuple(IDL.Principal, SatelliteConfig))],
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

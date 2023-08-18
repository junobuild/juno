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
	const DelOriginConfig = IDL.Record({ updated_at: IDL.Opt(IDL.Nat64) });
	const GetPageViews = IDL.Record({
		to: IDL.Opt(IDL.Nat64),
		from: IDL.Opt(IDL.Nat64),
		satellite_id: IDL.Opt(IDL.Principal)
	});
	const AnalyticKey = IDL.Record({
		key: IDL.Text,
		session_id: IDL.Text,
		satellite_id: IDL.Principal
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
		href: IDL.Text,
		created_at: IDL.Nat64,
		device: PageViewDevice,
		user_agent: IDL.Opt(IDL.Text),
		collected_at: IDL.Nat64
	});
	const OriginConfig = IDL.Record({
		key: IDL.Principal,
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		filter: IDL.Text
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
	const SetOriginConfig = IDL.Record({
		key: IDL.Principal,
		updated_at: IDL.Opt(IDL.Nat64),
		filter: IDL.Text
	});
	const SetPageView = IDL.Record({
		title: IDL.Text,
		updated_at: IDL.Opt(IDL.Nat64),
		referrer: IDL.Opt(IDL.Text),
		time_zone: IDL.Text,
		href: IDL.Text,
		device: PageViewDevice,
		user_agent: IDL.Opt(IDL.Text),
		collected_at: IDL.Nat64
	});
	const Result = IDL.Variant({ Ok: PageView, Err: IDL.Text });
	const Result_1 = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text });
	return IDL.Service({
		del_controllers: IDL.Func(
			[DeleteControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		del_origin_config: IDL.Func([IDL.Principal, DelOriginConfig], [], []),
		get_page_views: IDL.Func(
			[GetPageViews],
			[IDL.Vec(IDL.Tuple(AnalyticKey, PageView))],
			['query']
		),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_origin_configs: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, OriginConfig))], ['query']),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_origin_config: IDL.Func([IDL.Principal, SetOriginConfig], [OriginConfig], []),
		set_page_view: IDL.Func([AnalyticKey, SetPageView], [Result], []),
		set_page_views: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetPageView))], [Result_1], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

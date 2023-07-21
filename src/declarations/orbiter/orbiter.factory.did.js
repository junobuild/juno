// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const AnalyticKey = IDL.Record({
		key: IDL.Text,
		session_id: IDL.Text,
		satellite_id: IDL.Principal
	});
	const PageViewDevice = IDL.Record({
		inner_height: IDL.Nat16,
		inner_width: IDL.Nat16
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
	return IDL.Service({
		set_page_view: IDL.Func([AnalyticKey, SetPageView], [PageView], []),
		set_page_views: IDL.Func([IDL.Vec(IDL.Tuple(AnalyticKey, SetPageView))], [], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

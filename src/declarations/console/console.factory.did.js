export const idlFactory = ({ IDL }) => {
	const ControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const CreateSatelliteArgs = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		user: IDL.Principal
	});
	const GetCreateSatelliteFeeArgs = IDL.Record({ user: IDL.Principal });
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const ReleasesVersion = IDL.Record({
		satellite: IDL.Opt(IDL.Text),
		mission_control: IDL.Opt(IDL.Text)
	});
	const MissionControl = IDL.Record({
		updated_at: IDL.Nat64,
		credits: Tokens,
		mission_control_id: IDL.Opt(IDL.Principal),
		owner: IDL.Principal,
		created_at: IDL.Nat64
	});
	const Segment = IDL.Variant({
		MissionControl: IDL.Null,
		Satellite: IDL.Null
	});
	const LoadRelease = IDL.Record({ total: IDL.Nat64, chunks: IDL.Nat64 });
	const RateConfig = IDL.Record({
		max_tokens: IDL.Nat64,
		time_per_token_ns: IDL.Nat64
	});
	return IDL.Service({
		add_controllers: IDL.Func([ControllersArgs], [], []),
		add_invitation_code: IDL.Func([IDL.Text], [], []),
		create_satellite: IDL.Func([CreateSatelliteArgs], [IDL.Principal], []),
		get_create_satellite_fee: IDL.Func([GetCreateSatelliteFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_credits: IDL.Func([], [Tokens], ['query']),
		get_releases_version: IDL.Func([], [ReleasesVersion], ['query']),
		get_user_mission_control_center: IDL.Func([], [IDL.Opt(MissionControl)], ['query']),
		init_user_mission_control_center: IDL.Func([IDL.Opt(IDL.Text)], [MissionControl], []),
		list_user_mission_control_centers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, MissionControl))],
			['query']
		),
		load_release: IDL.Func([Segment, IDL.Vec(IDL.Nat8), IDL.Text], [LoadRelease], []),
		remove_controllers: IDL.Func([ControllersArgs], [], []),
		reset_release: IDL.Func([Segment], [], []),
		update_rate_config: IDL.Func([Segment, RateConfig], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
export const init = ({ IDL }) => {
	return [];
};

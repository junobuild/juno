// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const AssertMissionControlCenterArgs = IDL.Record({
		mission_control_id: IDL.Principal,
		user: IDL.Principal
	});
	const CreateCanisterArgs = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		user: IDL.Principal
	});
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const GetCreateCanisterFeeArgs = IDL.Record({ user: IDL.Principal });
	const ReleasesVersion = IDL.Record({
		satellite: IDL.Opt(IDL.Text),
		orbiter: IDL.Opt(IDL.Text),
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
		Orbiter: IDL.Null,
		MissionControl: IDL.Null,
		Satellite: IDL.Null
	});
	const LoadRelease = IDL.Record({ total: IDL.Nat64, chunks: IDL.Nat64 });
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null
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
	const RateConfig = IDL.Record({
		max_tokens: IDL.Nat64,
		time_per_token_ns: IDL.Nat64
	});
	return IDL.Service({
		add_credits: IDL.Func([IDL.Principal, Tokens], [], []),
		add_invitation_code: IDL.Func([IDL.Text], [], []),
		assert_mission_control_center: IDL.Func([AssertMissionControlCenterArgs], [], ['query']),
		create_orbiter: IDL.Func([CreateCanisterArgs], [IDL.Principal], []),
		create_satellite: IDL.Func([CreateCanisterArgs], [IDL.Principal], []),
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		get_create_orbiter_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_create_satellite_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_credits: IDL.Func([], [Tokens], ['query']),
		get_releases_version: IDL.Func([], [ReleasesVersion], ['query']),
		get_user_mission_control_center: IDL.Func([], [IDL.Opt(MissionControl)], ['query']),
		init_user_mission_control_center: IDL.Func([], [MissionControl], []),
		list_user_mission_control_centers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, MissionControl))],
			['query']
		),
		load_release: IDL.Func([Segment, IDL.Vec(IDL.Nat8), IDL.Text], [LoadRelease], []),
		reset_release: IDL.Func([Segment], [], []),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_fee: IDL.Func([Segment, Tokens], [], []),
		update_rate_config: IDL.Func([Segment, RateConfig], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

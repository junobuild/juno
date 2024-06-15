// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const AssertMissionControlCenterArgs = IDL.Record({
		mission_control_id: IDL.Principal,
		user: IDL.Principal
	});
	const CommitBatch = IDL.Record({
		batch_id: IDL.Nat,
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		chunk_ids: IDL.Vec(IDL.Nat)
	});
	const CommitBatchGroup = IDL.Record({
		sha256: IDL.Vec(IDL.Nat8),
		batch_group_id: IDL.Nat
	});
	const CreateCanisterArgs = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		user: IDL.Principal
	});
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const StorageConfigIFrame = IDL.Variant({
		Deny: IDL.Null,
		AllowAny: IDL.Null,
		SameOrigin: IDL.Null
	});
	const StorageConfigRawAccess = IDL.Variant({
		Deny: IDL.Null,
		Allow: IDL.Null
	});
	const StorageConfigRedirect = IDL.Record({
		status_code: IDL.Nat16,
		location: IDL.Text
	});
	const StorageConfig = IDL.Record({
		iframe: IDL.Opt(StorageConfigIFrame),
		rewrites: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)))),
		raw_access: IDL.Opt(StorageConfigRawAccess),
		redirects: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, StorageConfigRedirect)))
	});
	const Config = IDL.Record({ storage: StorageConfig });
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
	const InitAssetKey = IDL.Record({
		token: IDL.Opt(IDL.Text),
		collection: IDL.Text,
		name: IDL.Text,
		description: IDL.Opt(IDL.Text),
		encoding_type: IDL.Opt(IDL.Text),
		full_path: IDL.Text
	});
	const InitUploadResult = IDL.Record({ batch_id: IDL.Nat });
	const CustomDomain = IDL.Record({
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64),
		bn_id: IDL.Opt(IDL.Text)
	});
	const PaymentStatus = IDL.Variant({
		Refunded: IDL.Null,
		Acknowledged: IDL.Null,
		Completed: IDL.Null
	});
	const Payment = IDL.Record({
		status: PaymentStatus,
		updated_at: IDL.Nat64,
		block_index_payment: IDL.Nat64,
		mission_control_id: IDL.Opt(IDL.Principal),
		created_at: IDL.Nat64,
		block_index_refunded: IDL.Opt(IDL.Nat64)
	});
	const Segment = IDL.Variant({
		Orbiter: IDL.Null,
		MissionControl: IDL.Null,
		Satellite: IDL.Null
	});
	const LoadRelease = IDL.Record({ total: IDL.Nat64, chunks: IDL.Nat64 });
	const BatchGroupProposalStatus = IDL.Variant({
		Failed: IDL.Null,
		Open: IDL.Null,
		Rejected: IDL.Null,
		Executed: IDL.Null,
		Accepted: IDL.Null
	});
	const BatchGroupProposal = IDL.Record({
		status: BatchGroupProposalStatus,
		updated_at: IDL.Nat64,
		sha256: IDL.Vec(IDL.Nat8),
		executed_at: IDL.Opt(IDL.Nat64),
		owner: IDL.Principal,
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64)
	});
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
	const UploadChunk = IDL.Record({
		content: IDL.Vec(IDL.Nat8),
		batch_id: IDL.Nat,
		order_id: IDL.Opt(IDL.Nat)
	});
	const UploadChunkResult = IDL.Record({ chunk_id: IDL.Nat });
	return IDL.Service({
		add_credits: IDL.Func([IDL.Principal, Tokens], [], []),
		add_invitation_code: IDL.Func([IDL.Text], [], []),
		assert_mission_control_center: IDL.Func([AssertMissionControlCenterArgs], [], ['query']),
		commit_asset_upload: IDL.Func([CommitBatch], [], []),
		commit_assets_upload_group: IDL.Func([CommitBatchGroup], [], []),
		create_orbiter: IDL.Func([CreateCanisterArgs], [IDL.Principal], []),
		create_satellite: IDL.Func([CreateCanisterArgs], [IDL.Principal], []),
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		del_custom_domain: IDL.Func([IDL.Text], [], []),
		get_config: IDL.Func([], [Config], []),
		get_create_orbiter_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_create_satellite_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_credits: IDL.Func([], [Tokens], ['query']),
		get_releases_version: IDL.Func([], [ReleasesVersion], ['query']),
		get_user_mission_control_center: IDL.Func([], [IDL.Opt(MissionControl)], ['query']),
		init_asset_upload: IDL.Func([InitAssetKey, IDL.Nat], [InitUploadResult], []),
		init_assets_upload_group: IDL.Func([], [IDL.Nat], []),
		init_user_mission_control_center: IDL.Func([], [MissionControl], []),
		list_custom_domains: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, CustomDomain))], ['query']),
		list_payments: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Nat64, Payment))], ['query']),
		list_user_mission_control_centers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, MissionControl))],
			['query']
		),
		load_release: IDL.Func([Segment, IDL.Vec(IDL.Nat8), IDL.Text], [LoadRelease], []),
		propose_assets_upload_group: IDL.Func([IDL.Nat], [BatchGroupProposal], []),
		reset_release: IDL.Func([Segment], [], []),
		set_config: IDL.Func([Config], [], []),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_custom_domain: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [], []),
		set_fee: IDL.Func([Segment, Tokens], [], []),
		update_rate_config: IDL.Func([Segment, RateConfig], [], []),
		upload_asset_chunk: IDL.Func([UploadChunk], [UploadChunkResult], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

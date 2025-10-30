// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const AssertMissionControlCenterArgs = IDL.Record({
		mission_control_id: IDL.Principal,
		user: IDL.Principal
	});
	const OpenIdPrepareDelegationArgs = IDL.Record({
		jwt: IDL.Text,
		session_key: IDL.Vec(IDL.Nat8),
		salt: IDL.Vec(IDL.Nat8)
	});
	const AuthenticationArgs = IDL.Variant({
		OpenId: OpenIdPrepareDelegationArgs
	});
	const PreparedDelegation = IDL.Record({
		user_key: IDL.Vec(IDL.Nat8),
		expiration: IDL.Nat64
	});
	const OpenIdData = IDL.Record({
		name: IDL.Opt(IDL.Text),
		locale: IDL.Opt(IDL.Text),
		family_name: IDL.Opt(IDL.Text),
		email: IDL.Opt(IDL.Text),
		picture: IDL.Opt(IDL.Text),
		given_name: IDL.Opt(IDL.Text)
	});
	const Provider = IDL.Variant({
		InternetIdentity: IDL.Null,
		Google: OpenIdData
	});
	const MissionControl = IDL.Record({
		updated_at: IDL.Nat64,
		credits: Tokens,
		mission_control_id: IDL.Opt(IDL.Principal),
		provider: IDL.Opt(Provider),
		owner: IDL.Principal,
		created_at: IDL.Nat64
	});
	const Authentication = IDL.Record({
		delegation: PreparedDelegation,
		mission_control: MissionControl
	});
	const JwtFindProviderError = IDL.Variant({
		BadClaim: IDL.Text,
		BadSig: IDL.Text,
		NoMatchingProvider: IDL.Null
	});
	const JwtVerifyError = IDL.Variant({
		WrongKeyType: IDL.Null,
		MissingKid: IDL.Null,
		BadClaim: IDL.Text,
		BadSig: IDL.Text,
		NoKeyForKid: IDL.Null
	});
	const GetOrRefreshJwksError = IDL.Variant({
		InvalidConfig: IDL.Text,
		MissingKid: IDL.Null,
		BadClaim: IDL.Text,
		KeyNotFoundCooldown: IDL.Null,
		CertificateNotFound: IDL.Null,
		BadSig: IDL.Text,
		MissingLastAttempt: IDL.Text,
		KeyNotFound: IDL.Null,
		FetchFailed: IDL.Text
	});
	const PrepareDelegationError = IDL.Variant({
		JwtFindProvider: JwtFindProviderError,
		GetCachedJwks: IDL.Null,
		JwtVerify: JwtVerifyError,
		GetOrFetchJwks: GetOrRefreshJwksError,
		DeriveSeedFailed: IDL.Text
	});
	const AuthenticationError = IDL.Variant({
		PrepareDelegation: PrepareDelegationError,
		RegisterUser: IDL.Text
	});
	const Result = IDL.Variant({
		Ok: Authentication,
		Err: AuthenticationError
	});
	const CommitProposal = IDL.Record({
		sha256: IDL.Vec(IDL.Nat8),
		proposal_id: IDL.Nat
	});
	const CommitBatch = IDL.Record({
		batch_id: IDL.Nat,
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		chunk_ids: IDL.Vec(IDL.Nat)
	});
	const CreateCanisterArgs = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		subnet_id: IDL.Opt(IDL.Principal),
		user: IDL.Principal
	});
	const InitStorageMemory = IDL.Variant({
		Heap: IDL.Null,
		Stable: IDL.Null
	});
	const InitStorageArgs = IDL.Record({
		system_memory: IDL.Opt(InitStorageMemory)
	});
	const CreateSatelliteArgs = IDL.Record({
		block_index: IDL.Opt(IDL.Nat64),
		subnet_id: IDL.Opt(IDL.Principal),
		storage: IDL.Opt(InitStorageArgs),
		user: IDL.Principal
	});
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const DeleteProposalAssets = IDL.Record({
		proposal_ids: IDL.Vec(IDL.Nat)
	});
	const AuthenticationConfigOpenIdDelegation = IDL.Record({
		targets: IDL.Opt(IDL.Vec(IDL.Principal)),
		max_time_to_live: IDL.Opt(IDL.Nat64)
	});
	const OpenIdProvider = IDL.Variant({ Google: IDL.Null });
	const OpenIdProviderConfig = IDL.Record({ client_id: IDL.Text });
	const AuthenticationConfigOpenId = IDL.Record({
		observatory_id: IDL.Opt(IDL.Principal),
		delegation: IDL.Opt(AuthenticationConfigOpenIdDelegation),
		providers: IDL.Vec(IDL.Tuple(OpenIdProvider, OpenIdProviderConfig))
	});
	const AuthenticationConfigInternetIdentity = IDL.Record({
		derivation_origin: IDL.Opt(IDL.Text),
		external_alternative_origins: IDL.Opt(IDL.Vec(IDL.Text))
	});
	const AuthenticationRules = IDL.Record({
		allowed_callers: IDL.Vec(IDL.Principal)
	});
	const AuthenticationConfig = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		openid: IDL.Opt(AuthenticationConfigOpenId),
		created_at: IDL.Opt(IDL.Nat64),
		version: IDL.Opt(IDL.Nat64),
		internet_identity: IDL.Opt(AuthenticationConfigInternetIdentity),
		rules: IDL.Opt(AuthenticationRules)
	});
	const StorageConfigIFrame = IDL.Variant({
		Deny: IDL.Null,
		AllowAny: IDL.Null,
		SameOrigin: IDL.Null
	});
	const ConfigMaxMemorySize = IDL.Record({
		stable: IDL.Opt(IDL.Nat64),
		heap: IDL.Opt(IDL.Nat64)
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
		updated_at: IDL.Opt(IDL.Nat64),
		rewrites: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)))),
		created_at: IDL.Opt(IDL.Nat64),
		version: IDL.Opt(IDL.Nat64),
		max_memory_size: IDL.Opt(ConfigMaxMemorySize),
		raw_access: IDL.Opt(StorageConfigRawAccess),
		redirects: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, StorageConfigRedirect)))
	});
	const Config = IDL.Record({
		authentication: IDL.Opt(AuthenticationConfig),
		storage: StorageConfig
	});
	const GetCreateCanisterFeeArgs = IDL.Record({ user: IDL.Principal });
	const OpenIdGetDelegationArgs = IDL.Record({
		jwt: IDL.Text,
		session_key: IDL.Vec(IDL.Nat8),
		salt: IDL.Vec(IDL.Nat8),
		expiration: IDL.Nat64
	});
	const GetDelegationArgs = IDL.Variant({ OpenId: OpenIdGetDelegationArgs });
	const Delegation = IDL.Record({
		pubkey: IDL.Vec(IDL.Nat8),
		targets: IDL.Opt(IDL.Vec(IDL.Principal)),
		expiration: IDL.Nat64
	});
	const SignedDelegation = IDL.Record({
		signature: IDL.Vec(IDL.Nat8),
		delegation: Delegation
	});
	const GetDelegationError = IDL.Variant({
		JwtFindProvider: JwtFindProviderError,
		GetCachedJwks: IDL.Null,
		NoSuchDelegation: IDL.Null,
		JwtVerify: JwtVerifyError,
		GetOrFetchJwks: GetOrRefreshJwksError,
		DeriveSeedFailed: IDL.Text
	});
	const Result_1 = IDL.Variant({
		Ok: SignedDelegation,
		Err: GetDelegationError
	});
	const ProposalStatus = IDL.Variant({
		Initialized: IDL.Null,
		Failed: IDL.Null,
		Open: IDL.Null,
		Rejected: IDL.Null,
		Executed: IDL.Null,
		Accepted: IDL.Null
	});
	const AssetsUpgradeOptions = IDL.Record({
		clear_existing_assets: IDL.Opt(IDL.Bool)
	});
	const SegmentsDeploymentOptions = IDL.Record({
		orbiter: IDL.Opt(IDL.Text),
		mission_control_version: IDL.Opt(IDL.Text),
		satellite_version: IDL.Opt(IDL.Text)
	});
	const ProposalType = IDL.Variant({
		AssetsUpgrade: AssetsUpgradeOptions,
		SegmentsDeployment: SegmentsDeploymentOptions
	});
	const Proposal = IDL.Record({
		status: ProposalStatus,
		updated_at: IDL.Nat64,
		sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),
		executed_at: IDL.Opt(IDL.Nat64),
		owner: IDL.Principal,
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64),
		proposal_type: ProposalType
	});
	const HttpRequest = IDL.Record({
		url: IDL.Text,
		method: IDL.Text,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		certificate_version: IDL.Opt(IDL.Nat16)
	});
	const Memory = IDL.Variant({ Heap: IDL.Null, Stable: IDL.Null });
	const StreamingCallbackToken = IDL.Record({
		memory: Memory,
		token: IDL.Opt(IDL.Text),
		sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		index: IDL.Nat64,
		encoding_type: IDL.Text,
		full_path: IDL.Text
	});
	const StreamingStrategy = IDL.Variant({
		Callback: IDL.Record({
			token: StreamingCallbackToken,
			callback: IDL.Func([], [], ['query'])
		})
	});
	const HttpResponse = IDL.Record({
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		streaming_strategy: IDL.Opt(StreamingStrategy),
		status_code: IDL.Nat16
	});
	const StreamingCallbackHttpResponse = IDL.Record({
		token: IDL.Opt(StreamingCallbackToken),
		body: IDL.Vec(IDL.Nat8)
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
	const ListOrderField = IDL.Variant({
		UpdatedAt: IDL.Null,
		Keys: IDL.Null,
		CreatedAt: IDL.Null
	});
	const ListOrder = IDL.Record({ field: ListOrderField, desc: IDL.Bool });
	const TimestampMatcher = IDL.Variant({
		Equal: IDL.Nat64,
		Between: IDL.Tuple(IDL.Nat64, IDL.Nat64),
		GreaterThan: IDL.Nat64,
		LessThan: IDL.Nat64
	});
	const ListMatcher = IDL.Record({
		key: IDL.Opt(IDL.Text),
		updated_at: IDL.Opt(TimestampMatcher),
		description: IDL.Opt(IDL.Text),
		created_at: IDL.Opt(TimestampMatcher)
	});
	const ListPaginate = IDL.Record({
		start_after: IDL.Opt(IDL.Text),
		limit: IDL.Opt(IDL.Nat64)
	});
	const ListParams = IDL.Record({
		order: IDL.Opt(ListOrder),
		owner: IDL.Opt(IDL.Principal),
		matcher: IDL.Opt(ListMatcher),
		paginate: IDL.Opt(ListPaginate)
	});
	const AssetKey = IDL.Record({
		token: IDL.Opt(IDL.Text),
		collection: IDL.Text,
		owner: IDL.Principal,
		name: IDL.Text,
		description: IDL.Opt(IDL.Text),
		full_path: IDL.Text
	});
	const AssetEncodingNoContent = IDL.Record({
		modified: IDL.Nat64,
		sha256: IDL.Vec(IDL.Nat8),
		total_length: IDL.Nat
	});
	const AssetNoContent = IDL.Record({
		key: AssetKey,
		updated_at: IDL.Nat64,
		encodings: IDL.Vec(IDL.Tuple(IDL.Text, AssetEncodingNoContent)),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64)
	});
	const ListResults = IDL.Record({
		matches_pages: IDL.Opt(IDL.Nat64),
		matches_length: IDL.Nat64,
		items_page: IDL.Opt(IDL.Nat64),
		items: IDL.Vec(IDL.Tuple(IDL.Text, AssetNoContent)),
		items_length: IDL.Nat64
	});
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null,
		Submit: IDL.Null
	});
	const Controller = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
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
	const ListProposalsOrder = IDL.Record({ desc: IDL.Bool });
	const ListProposalsPaginate = IDL.Record({
		start_after: IDL.Opt(IDL.Nat),
		limit: IDL.Opt(IDL.Nat)
	});
	const ListProposalsParams = IDL.Record({
		order: IDL.Opt(ListProposalsOrder),
		paginate: IDL.Opt(ListProposalsPaginate)
	});
	const ProposalKey = IDL.Record({ proposal_id: IDL.Nat });
	const ListProposalResults = IDL.Record({
		matches_length: IDL.Nat64,
		items: IDL.Vec(IDL.Tuple(ProposalKey, Proposal)),
		items_length: IDL.Nat64
	});
	const SetAuthenticationConfig = IDL.Record({
		openid: IDL.Opt(AuthenticationConfigOpenId),
		version: IDL.Opt(IDL.Nat64),
		internet_identity: IDL.Opt(AuthenticationConfigInternetIdentity),
		rules: IDL.Opt(AuthenticationRules)
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
	const SegmentKind = IDL.Variant({
		Orbiter: IDL.Null,
		MissionControl: IDL.Null,
		Satellite: IDL.Null
	});
	const SetStorageConfig = IDL.Record({
		iframe: IDL.Opt(StorageConfigIFrame),
		rewrites: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)))),
		version: IDL.Opt(IDL.Nat64),
		max_memory_size: IDL.Opt(ConfigMaxMemorySize),
		raw_access: IDL.Opt(StorageConfigRawAccess),
		redirects: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, StorageConfigRedirect)))
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
		authenticate: IDL.Func([AuthenticationArgs], [Result], []),
		commit_proposal: IDL.Func([CommitProposal], [IDL.Null], []),
		commit_proposal_asset_upload: IDL.Func([CommitBatch], [], []),
		commit_proposal_many_assets_upload: IDL.Func([IDL.Vec(CommitBatch)], [], []),
		count_proposals: IDL.Func([], [IDL.Nat64], ['query']),
		create_orbiter: IDL.Func([CreateCanisterArgs], [IDL.Principal], []),
		create_satellite: IDL.Func([CreateSatelliteArgs], [IDL.Principal], []),
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		del_custom_domain: IDL.Func([IDL.Text], [], []),
		delete_proposal_assets: IDL.Func([DeleteProposalAssets], [], []),
		get_auth_config: IDL.Func([], [IDL.Opt(AuthenticationConfig)], ['query']),
		get_config: IDL.Func([], [Config], ['query']),
		get_create_orbiter_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_create_satellite_fee: IDL.Func([GetCreateCanisterFeeArgs], [IDL.Opt(Tokens)], ['query']),
		get_credits: IDL.Func([], [Tokens], ['query']),
		get_delegation: IDL.Func([GetDelegationArgs], [Result_1], ['query']),
		get_proposal: IDL.Func([IDL.Nat], [IDL.Opt(Proposal)], ['query']),
		get_storage_config: IDL.Func([], [StorageConfig], ['query']),
		get_user_mission_control_center: IDL.Func([], [IDL.Opt(MissionControl)], ['query']),
		http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
		http_request_streaming_callback: IDL.Func(
			[StreamingCallbackToken],
			[StreamingCallbackHttpResponse],
			['query']
		),
		init_proposal: IDL.Func([ProposalType], [IDL.Nat, Proposal], []),
		init_proposal_asset_upload: IDL.Func([InitAssetKey, IDL.Nat], [InitUploadResult], []),
		init_proposal_many_assets_upload: IDL.Func(
			[IDL.Vec(InitAssetKey), IDL.Nat],
			[IDL.Vec(IDL.Tuple(IDL.Text, InitUploadResult))],
			[]
		),
		init_user_mission_control_center: IDL.Func([], [MissionControl], []),
		list_assets: IDL.Func([IDL.Text, ListParams], [ListResults], ['query']),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_custom_domains: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, CustomDomain))], ['query']),
		list_payments: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Nat64, Payment))], ['query']),
		list_proposals: IDL.Func([ListProposalsParams], [ListProposalResults], ['query']),
		list_user_mission_control_centers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, MissionControl))],
			['query']
		),
		reject_proposal: IDL.Func([CommitProposal], [IDL.Null], []),
		set_auth_config: IDL.Func([SetAuthenticationConfig], [AuthenticationConfig], []),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_custom_domain: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [], []),
		set_fee: IDL.Func([SegmentKind, Tokens], [], []),
		set_storage_config: IDL.Func([SetStorageConfig], [StorageConfig], []),
		submit_proposal: IDL.Func([IDL.Nat], [IDL.Nat, Proposal], []),
		update_rate_config: IDL.Func([SegmentKind, RateConfig], [], []),
		upload_proposal_asset_chunk: IDL.Func([UploadChunk], [UploadChunkResult], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const CommitBatch = IDL.Record({
		batch_id: IDL.Nat,
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		chunk_ids: IDL.Vec(IDL.Nat)
	});
	const CommitProposal = IDL.Record({
		sha256: IDL.Vec(IDL.Nat8),
		proposal_id: IDL.Nat
	});
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
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
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
	const DelDoc = IDL.Record({ version: IDL.Opt(IDL.Nat64) });
	const CollectionType = IDL.Variant({ Db: IDL.Null, Storage: IDL.Null });
	const DelRule = IDL.Record({ version: IDL.Opt(IDL.Nat64) });
	const DeleteProposalAssets = IDL.Record({
		proposal_ids: IDL.Vec(IDL.Nat)
	});
	const DepositCyclesArgs = IDL.Record({
		cycles: IDL.Nat,
		destination_id: IDL.Principal
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
	const AuthenticationConfigInternetIdentity = IDL.Record({
		derivation_origin: IDL.Opt(IDL.Text),
		external_alternative_origins: IDL.Opt(IDL.Vec(IDL.Text))
	});
	const AuthenticationConfig = IDL.Record({
		internet_identity: IDL.Opt(AuthenticationConfigInternetIdentity)
	});
	const ConfigMaxMemorySize = IDL.Record({
		stable: IDL.Opt(IDL.Nat64),
		heap: IDL.Opt(IDL.Nat64)
	});
	const DbConfig = IDL.Record({
		max_memory_size: IDL.Opt(ConfigMaxMemorySize)
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
		max_memory_size: IDL.Opt(ConfigMaxMemorySize),
		raw_access: IDL.Opt(StorageConfigRawAccess),
		redirects: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, StorageConfigRedirect)))
	});
	const Config = IDL.Record({
		db: IDL.Opt(DbConfig),
		authentication: IDL.Opt(AuthenticationConfig),
		storage: StorageConfig
	});
	const Doc = IDL.Record({
		updated_at: IDL.Nat64,
		owner: IDL.Principal,
		data: IDL.Vec(IDL.Nat8),
		description: IDL.Opt(IDL.Text),
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64)
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
	const Memory = IDL.Variant({ Heap: IDL.Null, Stable: IDL.Null });
	const Permission = IDL.Variant({
		Controllers: IDL.Null,
		Private: IDL.Null,
		Public: IDL.Null,
		Managed: IDL.Null
	});
	const RateConfig = IDL.Record({
		max_tokens: IDL.Nat64,
		time_per_token_ns: IDL.Nat64
	});
	const Rule = IDL.Record({
		max_capacity: IDL.Opt(IDL.Nat32),
		memory: IDL.Opt(Memory),
		updated_at: IDL.Nat64,
		max_size: IDL.Opt(IDL.Nat),
		read: Permission,
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64),
		mutable_permissions: IDL.Opt(IDL.Bool),
		rate_config: IDL.Opt(RateConfig),
		write: Permission,
		max_changes_per_user: IDL.Opt(IDL.Nat32)
	});
	const HttpRequest = IDL.Record({
		url: IDL.Text,
		method: IDL.Text,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		certificate_version: IDL.Opt(IDL.Nat16)
	});
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
	const ListResults = IDL.Record({
		matches_pages: IDL.Opt(IDL.Nat64),
		matches_length: IDL.Nat64,
		items_page: IDL.Opt(IDL.Nat64),
		items: IDL.Vec(IDL.Tuple(IDL.Text, AssetNoContent)),
		items_length: IDL.Nat64
	});
	const CustomDomain = IDL.Record({
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		version: IDL.Opt(IDL.Nat64),
		bn_id: IDL.Opt(IDL.Text)
	});
	const ListResults_1 = IDL.Record({
		matches_pages: IDL.Opt(IDL.Nat64),
		matches_length: IDL.Nat64,
		items_page: IDL.Opt(IDL.Nat64),
		items: IDL.Vec(IDL.Tuple(IDL.Text, Doc)),
		items_length: IDL.Nat64
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
	const SetDoc = IDL.Record({
		data: IDL.Vec(IDL.Nat8),
		description: IDL.Opt(IDL.Text),
		version: IDL.Opt(IDL.Nat64)
	});
	const SetRule = IDL.Record({
		max_capacity: IDL.Opt(IDL.Nat32),
		memory: IDL.Opt(Memory),
		max_size: IDL.Opt(IDL.Nat),
		read: Permission,
		version: IDL.Opt(IDL.Nat64),
		mutable_permissions: IDL.Opt(IDL.Bool),
		rate_config: IDL.Opt(RateConfig),
		write: Permission,
		max_changes_per_user: IDL.Opt(IDL.Nat32)
	});
	const UploadChunk = IDL.Record({
		content: IDL.Vec(IDL.Nat8),
		batch_id: IDL.Nat,
		order_id: IDL.Opt(IDL.Nat)
	});
	const UploadChunkResult = IDL.Record({ chunk_id: IDL.Nat });
	return IDL.Service({
		commit_asset_upload: IDL.Func([CommitBatch], [], []),
		commit_proposal: IDL.Func([CommitProposal], [IDL.Null], []),
		commit_proposal_asset_upload: IDL.Func([CommitBatch], [], []),
		count_assets: IDL.Func([IDL.Text, ListParams], [IDL.Nat64], ['query']),
		count_collection_assets: IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
		count_collection_docs: IDL.Func([IDL.Text], [IDL.Nat64], ['query']),
		count_docs: IDL.Func([IDL.Text, ListParams], [IDL.Nat64], ['query']),
		count_proposals: IDL.Func([], [IDL.Nat64], ['query']),
		del_asset: IDL.Func([IDL.Text, IDL.Text], [], []),
		del_assets: IDL.Func([IDL.Text], [], []),
		del_controllers: IDL.Func(
			[DeleteControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		del_custom_domain: IDL.Func([IDL.Text], [], []),
		del_doc: IDL.Func([IDL.Text, IDL.Text, DelDoc], [], []),
		del_docs: IDL.Func([IDL.Text], [], []),
		del_filtered_assets: IDL.Func([IDL.Text, ListParams], [], []),
		del_filtered_docs: IDL.Func([IDL.Text, ListParams], [], []),
		del_many_assets: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [], []),
		del_many_docs: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, DelDoc))], [], []),
		del_rule: IDL.Func([CollectionType, IDL.Text, DelRule], [], []),
		delete_proposal_assets: IDL.Func([DeleteProposalAssets], [], []),
		deposit_cycles: IDL.Func([DepositCyclesArgs], [], []),
		get_asset: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(AssetNoContent)], ['query']),
		get_auth_config: IDL.Func([], [IDL.Opt(AuthenticationConfig)], ['query']),
		get_config: IDL.Func([], [Config], []),
		get_db_config: IDL.Func([], [IDL.Opt(DbConfig)], ['query']),
		get_doc: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Doc)], ['query']),
		get_many_assets: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[IDL.Vec(IDL.Tuple(IDL.Text, IDL.Opt(AssetNoContent)))],
			['query']
		),
		get_many_docs: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[IDL.Vec(IDL.Tuple(IDL.Text, IDL.Opt(Doc)))],
			['query']
		),
		get_proposal: IDL.Func([IDL.Nat], [IDL.Opt(Proposal)], ['query']),
		get_rule: IDL.Func([CollectionType, IDL.Text], [IDL.Opt(Rule)], ['query']),
		get_storage_config: IDL.Func([], [StorageConfig], ['query']),
		http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
		http_request_streaming_callback: IDL.Func(
			[StreamingCallbackToken],
			[StreamingCallbackHttpResponse],
			['query']
		),
		init_asset_upload: IDL.Func([InitAssetKey], [InitUploadResult], []),
		init_proposal: IDL.Func([ProposalType], [IDL.Nat, Proposal], []),
		init_proposal_asset_upload: IDL.Func([InitAssetKey, IDL.Nat], [InitUploadResult], []),
		list_assets: IDL.Func([IDL.Text, ListParams], [ListResults], ['query']),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_custom_domains: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, CustomDomain))], ['query']),
		list_docs: IDL.Func([IDL.Text, ListParams], [ListResults_1], ['query']),
		list_proposals: IDL.Func([ListProposalsParams], [ListProposalResults], ['query']),
		list_rules: IDL.Func([CollectionType], [IDL.Vec(IDL.Tuple(IDL.Text, Rule))], ['query']),
		memory_size: IDL.Func([], [MemorySize], ['query']),
		reject_proposal: IDL.Func([CommitProposal], [IDL.Null], []),
		set_auth_config: IDL.Func([AuthenticationConfig], [], []),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_custom_domain: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [], []),
		set_db_config: IDL.Func([DbConfig], [], []),
		set_doc: IDL.Func([IDL.Text, IDL.Text, SetDoc], [Doc], []),
		set_many_docs: IDL.Func(
			[IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text, SetDoc))],
			[IDL.Vec(IDL.Tuple(IDL.Text, Doc))],
			[]
		),
		set_rule: IDL.Func([CollectionType, IDL.Text, SetRule], [Rule], []),
		set_storage_config: IDL.Func([StorageConfig], [], []),
		submit_proposal: IDL.Func([IDL.Nat], [IDL.Nat, Proposal], []),
		upload_asset_chunk: IDL.Func([UploadChunk], [UploadChunkResult], []),
		upload_proposal_asset_chunk: IDL.Func([UploadChunk], [UploadChunkResult], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

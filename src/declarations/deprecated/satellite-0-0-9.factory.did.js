// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const CommitBatch = IDL.Record({
		batch_id: IDL.Nat,
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		chunk_ids: IDL.Vec(IDL.Nat)
	});
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
	const DelDoc = IDL.Record({ updated_at: IDL.Opt(IDL.Nat64) });
	const RulesType = IDL.Variant({ Db: IDL.Null, Storage: IDL.Null });
	const StorageConfig = IDL.Record({
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))))
	});
	const Config = IDL.Record({ storage: StorageConfig });
	const Doc = IDL.Record({
		updated_at: IDL.Nat64,
		owner: IDL.Principal,
		data: IDL.Vec(IDL.Nat8),
		description: IDL.Opt(IDL.Text),
		created_at: IDL.Nat64
	});
	const HttpRequest = IDL.Record({
		url: IDL.Text,
		method: IDL.Text,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))
	});
	const StreamingCallbackToken = IDL.Record({
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
			callback: IDL.Func([], [], [])
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
	const ListMatcher = IDL.Record({
		key: IDL.Opt(IDL.Text),
		description: IDL.Opt(IDL.Text)
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
		created_at: IDL.Nat64
	});
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
		bn_id: IDL.Opt(IDL.Text)
	});
	const ListResults_1 = IDL.Record({
		matches_pages: IDL.Opt(IDL.Nat64),
		matches_length: IDL.Nat64,
		items_page: IDL.Opt(IDL.Nat64),
		items: IDL.Vec(IDL.Tuple(IDL.Text, Doc)),
		items_length: IDL.Nat64
	});
	const Permission = IDL.Variant({
		Controllers: IDL.Null,
		Private: IDL.Null,
		Public: IDL.Null,
		Managed: IDL.Null
	});
	const Rule = IDL.Record({
		updated_at: IDL.Nat64,
		max_size: IDL.Opt(IDL.Nat),
		read: Permission,
		created_at: IDL.Nat64,
		write: Permission
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
	const SetDoc = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		data: IDL.Vec(IDL.Nat8),
		description: IDL.Opt(IDL.Text)
	});
	const SetRule = IDL.Record({
		updated_at: IDL.Opt(IDL.Nat64),
		max_size: IDL.Opt(IDL.Nat),
		read: Permission,
		write: Permission
	});
	const Chunk = IDL.Record({
		content: IDL.Vec(IDL.Nat8),
		batch_id: IDL.Nat
	});
	const UploadChunk = IDL.Record({ chunk_id: IDL.Nat });
	return IDL.Service({
		commit_asset_upload: IDL.Func([CommitBatch], [], []),
		del_asset: IDL.Func([IDL.Text, IDL.Text], [], []),
		del_assets: IDL.Func([IDL.Opt(IDL.Text)], [], []),
		del_controllers: IDL.Func(
			[DeleteControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		del_custom_domain: IDL.Func([IDL.Text], [], []),
		del_doc: IDL.Func([IDL.Text, IDL.Text, DelDoc], [], []),
		del_rule: IDL.Func([RulesType, IDL.Text, DelDoc], [], []),
		get_config: IDL.Func([], [Config], []),
		get_doc: IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(Doc)], ['query']),
		http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
		http_request_streaming_callback: IDL.Func(
			[StreamingCallbackToken],
			[StreamingCallbackHttpResponse],
			['query']
		),
		init_asset_upload: IDL.Func([InitAssetKey], [InitUploadResult], []),
		list_assets: IDL.Func([IDL.Opt(IDL.Text), ListParams], [ListResults], ['query']),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		list_custom_domains: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, CustomDomain))], ['query']),
		list_docs: IDL.Func([IDL.Text, ListParams], [ListResults_1], ['query']),
		list_rules: IDL.Func([RulesType], [IDL.Vec(IDL.Tuple(IDL.Text, Rule))], ['query']),
		set_config: IDL.Func([Config], [], []),
		set_controllers: IDL.Func(
			[SetControllersArgs],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			[]
		),
		set_custom_domain: IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [], []),
		set_doc: IDL.Func([IDL.Text, IDL.Text, SetDoc], [Doc], []),
		set_rule: IDL.Func([RulesType, IDL.Text, SetRule], [], []),
		upload_asset_chunk: IDL.Func([Chunk], [UploadChunk], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

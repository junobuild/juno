import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface AssetEncodingNoContent {
	modified: bigint;
	sha256: Uint8Array;
	total_length: bigint;
}
export interface AssetKey {
	token: [] | [string];
	collection: string;
	owner: Principal;
	name: string;
	full_path: string;
}
export interface AssetNoContent {
	key: AssetKey;
	updated_at: bigint;
	encodings: Array<[string, AssetEncodingNoContent]>;
	headers: Array<[string, string]>;
	created_at: bigint;
}
export interface Chunk {
	content: Uint8Array;
	batch_id: bigint;
}
export interface CommitBatch {
	batch_id: bigint;
	headers: Array<[string, string]>;
	chunk_ids: Array<bigint>;
}
export interface Config {
	storage: StorageConfig;
}
export interface ControllersArgs {
	controllers: Array<Principal>;
}
export interface CustomDomain {
	updated_at: bigint;
	created_at: bigint;
	bn_id: [] | [string];
}
export interface DelDoc {
	updated_at: [] | [bigint];
}
export interface Doc {
	updated_at: bigint;
	owner: Principal;
	data: Uint8Array;
	created_at: bigint;
}
export interface HttpRequest {
	url: string;
	method: string;
	body: Uint8Array;
	headers: Array<[string, string]>;
}
export interface HttpResponse {
	body: Uint8Array;
	headers: Array<[string, string]>;
	streaming_strategy: [] | [StreamingStrategy];
	status_code: number;
}
export interface InitAssetKey {
	token: [] | [string];
	collection: string;
	name: string;
	encoding_type: [] | [string];
	full_path: string;
}
export interface InitUploadResult {
	batch_id: bigint;
}
export interface ListParams {
	order: [] | [OrderKeys];
	matcher: [] | [string];
	paginate: [] | [PaginateKeys];
}
export interface ListResults {
	matches_length: bigint;
	length: bigint;
	items: Array<[string, AssetNoContent]>;
}
export interface ListResults_1 {
	matches_length: bigint;
	length: bigint;
	items: Array<[string, Doc]>;
}
export interface OrderKeys {
	desc: boolean;
}
export interface PaginateKeys {
	start_after: [] | [string];
	limit: [] | [bigint];
}
export type Permission =
	| { Controllers: null }
	| { Private: null }
	| { Public: null }
	| { Managed: null };
export interface Rule {
	updated_at: bigint;
	max_size: [] | [bigint];
	read: Permission;
	created_at: bigint;
	write: Permission;
}
export type RulesType = { Db: null } | { Storage: null };
export interface SetDoc {
	updated_at: [] | [bigint];
	data: Uint8Array;
}
export interface SetRule {
	updated_at: [] | [bigint];
	max_size: [] | [bigint];
	read: Permission;
	write: Permission;
}
export interface StorageConfig {
	headers: Array<[string, Array<[string, string]>]>;
}
export interface StreamingCallbackHttpResponse {
	token: [] | [StreamingCallbackToken];
	body: Uint8Array;
}
export interface StreamingCallbackToken {
	token: [] | [string];
	sha256: [] | [Uint8Array];
	headers: Array<[string, string]>;
	index: bigint;
	encoding_type: string;
	full_path: string;
}
export type StreamingStrategy = {
	Callback: {
		token: StreamingCallbackToken;
		callback: [Principal, string];
	};
};
export interface UploadChunk {
	chunk_id: bigint;
}
export interface _SERVICE {
	add_controllers: ActorMethod<[ControllersArgs], Array<Principal>>;
	commit_asset_upload: ActorMethod<[CommitBatch], undefined>;
	del_asset: ActorMethod<[string, string], undefined>;
	del_assets: ActorMethod<[[] | [string]], undefined>;
	del_custom_domain: ActorMethod<[string], undefined>;
	del_doc: ActorMethod<[string, string, DelDoc], undefined>;
	get_config: ActorMethod<[], Config>;
	get_doc: ActorMethod<[string, string], [] | [Doc]>;
	http_request: ActorMethod<[HttpRequest], HttpResponse>;
	http_request_streaming_callback: ActorMethod<
		[StreamingCallbackToken],
		StreamingCallbackHttpResponse
	>;
	init_asset_upload: ActorMethod<[InitAssetKey], InitUploadResult>;
	list_assets: ActorMethod<[[] | [string], ListParams], ListResults>;
	list_controllers: ActorMethod<[], Array<Principal>>;
	list_custom_domains: ActorMethod<[], Array<[string, CustomDomain]>>;
	list_docs: ActorMethod<[string, ListParams], ListResults_1>;
	list_rules: ActorMethod<[RulesType], Array<[string, Rule]>>;
	remove_controllers: ActorMethod<[ControllersArgs], Array<Principal>>;
	set_config: ActorMethod<[Config], undefined>;
	set_custom_domain: ActorMethod<[string, [] | [string]], undefined>;
	set_doc: ActorMethod<[string, string, SetDoc], Doc>;
	set_rule: ActorMethod<[RulesType, string, SetRule], undefined>;
	upload_asset_chunk: ActorMethod<[Chunk], UploadChunk>;
	version: ActorMethod<[], string>;
}

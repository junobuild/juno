import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface AssetEncodingNoContent {
	modified: bigint;
	sha256: Uint8Array | number[];
	total_length: bigint;
}
export interface AssetKey {
	token: [] | [string];
	collection: string;
	owner: Principal;
	name: string;
	description: [] | [string];
	full_path: string;
}
export interface AssetNoContent {
	key: AssetKey;
	updated_at: bigint;
	encodings: Array<[string, AssetEncodingNoContent]>;
	headers: Array<[string, string]>;
	created_at: bigint;
}
export interface CommitBatch {
	batch_id: bigint;
	headers: Array<[string, string]>;
	chunk_ids: Array<bigint>;
}
export interface Config {
	storage: StorageConfig;
}
export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface CustomDomain {
	updated_at: bigint;
	created_at: bigint;
	bn_id: [] | [string];
}
export interface DelDoc {
	updated_at: [] | [bigint];
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface DepositCyclesArgs {
	cycles: bigint;
	destination_id: Principal;
}
export interface Doc {
	updated_at: bigint;
	owner: Principal;
	data: Uint8Array | number[];
	description: [] | [string];
	created_at: bigint;
}
export interface HttpRequest {
	url: string;
	method: string;
	body: Uint8Array | number[];
	headers: Array<[string, string]>;
	certificate_version: [] | [number];
}
export interface HttpResponse {
	body: Uint8Array | number[];
	headers: Array<[string, string]>;
	streaming_strategy: [] | [StreamingStrategy];
	status_code: number;
}
export interface InitAssetKey {
	token: [] | [string];
	collection: string;
	name: string;
	description: [] | [string];
	encoding_type: [] | [string];
	full_path: string;
}
export interface InitUploadResult {
	batch_id: bigint;
}
export interface ListMatcher {
	key: [] | [string];
	description: [] | [string];
}
export interface ListOrder {
	field: ListOrderField;
	desc: boolean;
}
export type ListOrderField = { UpdatedAt: null } | { Keys: null } | { CreatedAt: null };
export interface ListPaginate {
	start_after: [] | [string];
	limit: [] | [bigint];
}
export interface ListParams {
	order: [] | [ListOrder];
	owner: [] | [Principal];
	matcher: [] | [ListMatcher];
	paginate: [] | [ListPaginate];
}
export interface ListResults {
	matches_pages: [] | [bigint];
	matches_length: bigint;
	items_page: [] | [bigint];
	items: Array<[string, AssetNoContent]>;
	items_length: bigint;
}
export interface ListResults_1 {
	matches_pages: [] | [bigint];
	matches_length: bigint;
	items_page: [] | [bigint];
	items: Array<[string, Doc]>;
	items_length: bigint;
}
export type Memory = { Heap: null } | { Stable: null } | { StableV2: null };
export interface MemorySize {
	stable: bigint;
	heap: bigint;
}
export type Permission =
	| { Controllers: null }
	| { Private: null }
	| { Public: null }
	| { Managed: null };
export interface Rule {
	memory: [] | [Memory];
	updated_at: bigint;
	max_size: [] | [bigint];
	read: Permission;
	created_at: bigint;
	mutable_permissions: [] | [boolean];
	write: Permission;
}
export type RulesType = { Db: null } | { Storage: null };
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface SetDoc {
	updated_at: [] | [bigint];
	data: Uint8Array | number[];
	description: [] | [string];
}
export interface SetRule {
	memory: [] | [Memory];
	updated_at: [] | [bigint];
	max_size: [] | [bigint];
	read: Permission;
	mutable_permissions: [] | [boolean];
	write: Permission;
}
export interface StorageConfig {
	iframe: [] | [StorageConfigIFrame];
	rewrites: Array<[string, string]>;
	headers: Array<[string, Array<[string, string]>]>;
	redirects: [] | [Array<[string, StorageConfigRedirect]>];
}
export type StorageConfigIFrame = { Deny: null } | { AllowAny: null } | { SameOrigin: null };
export interface StorageConfigRedirect {
	status_code: number;
	location: string;
}
export interface StreamingCallbackHttpResponse {
	token: [] | [StreamingCallbackToken];
	body: Uint8Array | number[];
}
export interface StreamingCallbackToken {
	memory: Memory;
	token: [] | [string];
	sha256: [] | [Uint8Array | number[]];
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
	content: Uint8Array | number[];
	batch_id: bigint;
	order_id: [] | [bigint];
}
export interface UploadChunkResult {
	chunk_id: bigint;
}
export interface _SERVICE {
	build_version: ActorMethod<[], string>;
	commit_asset_upload: ActorMethod<[CommitBatch], undefined>;
	count_assets: ActorMethod<[string], bigint>;
	count_docs: ActorMethod<[string], bigint>;
	del_asset: ActorMethod<[string, string], undefined>;
	del_assets: ActorMethod<[string], undefined>;
	del_controllers: ActorMethod<[DeleteControllersArgs], Array<[Principal, Controller]>>;
	del_custom_domain: ActorMethod<[string], undefined>;
	del_doc: ActorMethod<[string, string, DelDoc], undefined>;
	del_docs: ActorMethod<[string], undefined>;
	del_many_assets: ActorMethod<[Array<[string, string]>], undefined>;
	del_many_docs: ActorMethod<[Array<[string, string, DelDoc]>], undefined>;
	del_rule: ActorMethod<[RulesType, string, DelDoc], undefined>;
	deposit_cycles: ActorMethod<[DepositCyclesArgs], undefined>;
	get_asset: ActorMethod<[string, string], [] | [AssetNoContent]>;
	get_config: ActorMethod<[], Config>;
	get_doc: ActorMethod<[string, string], [] | [Doc]>;
	get_many_assets: ActorMethod<[Array<[string, string]>], Array<[string, [] | [AssetNoContent]]>>;
	get_many_docs: ActorMethod<[Array<[string, string]>], Array<[string, [] | [Doc]]>>;
	http_request: ActorMethod<[HttpRequest], HttpResponse>;
	http_request_streaming_callback: ActorMethod<
		[StreamingCallbackToken],
		StreamingCallbackHttpResponse
	>;
	init_asset_upload: ActorMethod<[InitAssetKey], InitUploadResult>;
	list_assets: ActorMethod<[string, ListParams], ListResults>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_custom_domains: ActorMethod<[], Array<[string, CustomDomain]>>;
	list_docs: ActorMethod<[string, ListParams], ListResults_1>;
	list_rules: ActorMethod<[RulesType], Array<[string, Rule]>>;
	memory_size: ActorMethod<[], MemorySize>;
	set_config: ActorMethod<[Config], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], Array<[Principal, Controller]>>;
	set_custom_domain: ActorMethod<[string, [] | [string]], undefined>;
	set_doc: ActorMethod<[string, string, SetDoc], Doc>;
	set_many_docs: ActorMethod<[Array<[string, string, SetDoc]>], Array<[string, Doc]>>;
	set_rule: ActorMethod<[RulesType, string, SetRule], undefined>;
	upload_asset_chunk: ActorMethod<[UploadChunk], UploadChunkResult>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

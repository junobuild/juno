import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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
	description: [] | [string];
	full_path: string;
}
export interface AssetNoContent {
	key: AssetKey;
	updated_at: bigint;
	encodings: Array<[string, AssetEncodingNoContent]>;
	headers: Array<[string, string]>;
	created_at: bigint;
	version: [] | [bigint];
}
export interface AuthenticationConfig {
	internet_identity: [] | [AuthenticationConfigInternetIdentity];
}
export interface AuthenticationConfigInternetIdentity {
	derivation_origin: [] | [string];
}
export type CollectionType = { Db: null } | { Storage: null };
export interface CommitBatch {
	batch_id: bigint;
	headers: Array<[string, string]>;
	chunk_ids: Array<bigint>;
}
export interface Config {
	db: [] | [DbConfig];
	authentication: [] | [AuthenticationConfig];
	storage: StorageConfig;
}
export interface ConfigMaxMemorySize {
	stable: [] | [bigint];
	heap: [] | [bigint];
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
	version: [] | [bigint];
	bn_id: [] | [string];
}
export interface DbConfig {
	max_memory_size: [] | [ConfigMaxMemorySize];
}
export interface DelDoc {
	version: [] | [bigint];
}
export interface DelRule {
	version: [] | [bigint];
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
	data: Uint8Array;
	description: [] | [string];
	created_at: bigint;
	version: [] | [bigint];
}
export interface HttpRequest {
	url: string;
	method: string;
	body: Uint8Array;
	headers: Array<[string, string]>;
	certificate_version: [] | [number];
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
	description: [] | [string];
	encoding_type: [] | [string];
	full_path: string;
}
export interface InitUploadResult {
	batch_id: bigint;
}
export interface ListMatcher {
	key: [] | [string];
	updated_at: [] | [TimestampMatcher];
	description: [] | [string];
	created_at: [] | [TimestampMatcher];
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
export type Memory = { Heap: null } | { Stable: null };
export interface MemorySize {
	stable: bigint;
	heap: bigint;
}
export type Permission =
	| { Controllers: null }
	| { Private: null }
	| { Public: null }
	| { Managed: null };
export interface RateConfig {
	max_tokens: bigint;
	time_per_token_ns: bigint;
}
export interface Rule {
	max_capacity: [] | [number];
	memory: [] | [Memory];
	updated_at: bigint;
	max_size: [] | [bigint];
	read: Permission;
	created_at: bigint;
	version: [] | [bigint];
	mutable_permissions: [] | [boolean];
	rate_config: [] | [RateConfig];
	write: Permission;
}
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
	data: Uint8Array;
	description: [] | [string];
	version: [] | [bigint];
}
export interface SetRule {
	max_capacity: [] | [number];
	memory: [] | [Memory];
	max_size: [] | [bigint];
	read: Permission;
	version: [] | [bigint];
	mutable_permissions: [] | [boolean];
	rate_config: [] | [RateConfig];
	write: Permission;
}
export interface SetUserUsage {
	items_count: number;
}
export interface StorageConfig {
	iframe: [] | [StorageConfigIFrame];
	rewrites: Array<[string, string]>;
	headers: Array<[string, Array<[string, string]>]>;
	max_memory_size: [] | [ConfigMaxMemorySize];
	raw_access: [] | [StorageConfigRawAccess];
	redirects: [] | [Array<[string, StorageConfigRedirect]>];
}
export type StorageConfigIFrame = { Deny: null } | { AllowAny: null } | { SameOrigin: null };
export type StorageConfigRawAccess = { Deny: null } | { Allow: null };
export interface StorageConfigRedirect {
	status_code: number;
	location: string;
}
export interface StreamingCallbackHttpResponse {
	token: [] | [StreamingCallbackToken];
	body: Uint8Array;
}
export interface StreamingCallbackToken {
	memory: Memory;
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
export type TimestampMatcher =
	| { Equal: bigint }
	| { Between: [bigint, bigint] }
	| { GreaterThan: bigint }
	| { LessThan: bigint };
export interface UploadChunk {
	content: Uint8Array;
	batch_id: bigint;
	order_id: [] | [bigint];
}
export interface UploadChunkResult {
	chunk_id: bigint;
}
export interface UserUsage {
	updated_at: bigint;
	created_at: bigint;
	version: [] | [bigint];
	items_count: number;
}
export interface _SERVICE {
	build_version: ActorMethod<[], string>;
	commit_asset_upload: ActorMethod<[CommitBatch], undefined>;
	count_assets: ActorMethod<[string, ListParams], bigint>;
	count_collection_assets: ActorMethod<[string], bigint>;
	count_collection_docs: ActorMethod<[string], bigint>;
	count_docs: ActorMethod<[string, ListParams], bigint>;
	del_asset: ActorMethod<[string, string], undefined>;
	del_assets: ActorMethod<[string], undefined>;
	del_controllers: ActorMethod<[DeleteControllersArgs], Array<[Principal, Controller]>>;
	del_custom_domain: ActorMethod<[string], undefined>;
	del_doc: ActorMethod<[string, string, DelDoc], undefined>;
	del_docs: ActorMethod<[string], undefined>;
	del_filtered_assets: ActorMethod<[string, ListParams], undefined>;
	del_filtered_docs: ActorMethod<[string, ListParams], undefined>;
	del_many_assets: ActorMethod<[Array<[string, string]>], undefined>;
	del_many_docs: ActorMethod<[Array<[string, string, DelDoc]>], undefined>;
	del_rule: ActorMethod<[CollectionType, string, DelRule], undefined>;
	deposit_cycles: ActorMethod<[DepositCyclesArgs], undefined>;
	get_asset: ActorMethod<[string, string], [] | [AssetNoContent]>;
	get_auth_config: ActorMethod<[], [] | [AuthenticationConfig]>;
	get_config: ActorMethod<[], Config>;
	get_db_config: ActorMethod<[], [] | [DbConfig]>;
	get_doc: ActorMethod<[string, string], [] | [Doc]>;
	get_many_assets: ActorMethod<[Array<[string, string]>], Array<[string, [] | [AssetNoContent]]>>;
	get_many_docs: ActorMethod<[Array<[string, string]>], Array<[string, [] | [Doc]]>>;
	get_rule: ActorMethod<[CollectionType, string], [] | [Rule]>;
	get_storage_config: ActorMethod<[], StorageConfig>;
	get_user_usage: ActorMethod<[string, CollectionType, [] | [Principal]], [] | [UserUsage]>;
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
	list_rules: ActorMethod<[CollectionType], Array<[string, Rule]>>;
	memory_size: ActorMethod<[], MemorySize>;
	set_auth_config: ActorMethod<[AuthenticationConfig], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], Array<[Principal, Controller]>>;
	set_custom_domain: ActorMethod<[string, [] | [string]], undefined>;
	set_db_config: ActorMethod<[DbConfig], undefined>;
	set_doc: ActorMethod<[string, string, SetDoc], Doc>;
	set_many_docs: ActorMethod<[Array<[string, string, SetDoc]>], Array<[string, Doc]>>;
	set_rule: ActorMethod<[CollectionType, string, SetRule], Rule>;
	set_storage_config: ActorMethod<[StorageConfig], undefined>;
	set_user_usage: ActorMethod<[string, CollectionType, Principal, SetUserUsage], UserUsage>;
	upload_asset_chunk: ActorMethod<[UploadChunk], UploadChunkResult>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

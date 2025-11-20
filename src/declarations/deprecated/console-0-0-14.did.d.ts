import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface AssertMissionControlCenterArgs {
	mission_control_id: Principal;
	user: Principal;
}
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
export interface AssetsUpgradeOptions {
	clear_existing_assets: [] | [boolean];
}
export interface CommitBatch {
	batch_id: bigint;
	headers: Array<[string, string]>;
	chunk_ids: Array<bigint>;
}
export interface CommitProposal {
	sha256: Uint8Array;
	proposal_id: bigint;
}
export interface Config {
	storage: StorageConfig;
}
export interface ConfigMaxMemorySize {
	stable: [] | [bigint];
	heap: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface CreateCanisterArgs {
	block_index: [] | [bigint];
	subnet_id: [] | [Principal];
	user: Principal;
}
export interface CustomDomain {
	updated_at: bigint;
	created_at: bigint;
	version: [] | [bigint];
	bn_id: [] | [string];
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface DeleteProposalAssets {
	proposal_ids: Array<bigint>;
}
export interface GetCreateCanisterFeeArgs {
	user: Principal;
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
export type Memory = { Heap: null } | { Stable: null };
export interface MissionControl {
	updated_at: bigint;
	credits: Tokens;
	mission_control_id: [] | [Principal];
	owner: Principal;
	created_at: bigint;
}
export interface Payment {
	status: PaymentStatus;
	updated_at: bigint;
	block_index_payment: bigint;
	mission_control_id: [] | [Principal];
	created_at: bigint;
	block_index_refunded: [] | [bigint];
}
export type PaymentStatus = { Refunded: null } | { Acknowledged: null } | { Completed: null };
export interface Proposal {
	status: ProposalStatus;
	updated_at: bigint;
	sha256: [] | [Uint8Array];
	executed_at: [] | [bigint];
	owner: Principal;
	created_at: bigint;
	version: [] | [bigint];
	proposal_type: ProposalType;
}
export type ProposalStatus =
	| { Initialized: null }
	| { Failed: null }
	| { Open: null }
	| { Rejected: null }
	| { Executed: null }
	| { Accepted: null };
export type ProposalType =
	| { AssetsUpgrade: AssetsUpgradeOptions }
	| { SegmentsDeployment: SegmentsDeploymentOptions };
export interface RateConfig {
	max_tokens: bigint;
	time_per_token_ns: bigint;
}
export type SegmentType = { Orbiter: null } | { MissionControl: null } | { Satellite: null };
export interface SegmentsDeploymentOptions {
	orbiter: [] | [string];
	mission_control_version: [] | [string];
	satellite_version: [] | [string];
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
export interface Tokens {
	e8s: bigint;
}
export interface UploadChunk {
	content: Uint8Array;
	batch_id: bigint;
	order_id: [] | [bigint];
}
export interface UploadChunkResult {
	chunk_id: bigint;
}
export interface _SERVICE {
	add_credits: ActorMethod<[Principal, Tokens], undefined>;
	add_invitation_code: ActorMethod<[string], undefined>;
	assert_mission_control_center: ActorMethod<[AssertMissionControlCenterArgs], undefined>;
	commit_asset_upload: ActorMethod<[CommitBatch], undefined>;
	commit_proposal: ActorMethod<[CommitProposal], null>;
	create_orbiter: ActorMethod<[CreateCanisterArgs], Principal>;
	create_satellite: ActorMethod<[CreateCanisterArgs], Principal>;
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	del_custom_domain: ActorMethod<[string], undefined>;
	delete_proposal_assets: ActorMethod<[DeleteProposalAssets], undefined>;
	get_config: ActorMethod<[], Config>;
	get_create_orbiter_fee: ActorMethod<[GetCreateCanisterFeeArgs], [] | [Tokens]>;
	get_create_satellite_fee: ActorMethod<[GetCreateCanisterFeeArgs], [] | [Tokens]>;
	get_credits: ActorMethod<[], Tokens>;
	get_proposal: ActorMethod<[bigint], [] | [Proposal]>;
	get_storage_config: ActorMethod<[], StorageConfig>;
	get_user_mission_control_center: ActorMethod<[], [] | [MissionControl]>;
	http_request: ActorMethod<[HttpRequest], HttpResponse>;
	http_request_streaming_callback: ActorMethod<
		[StreamingCallbackToken],
		StreamingCallbackHttpResponse
	>;
	init_asset_upload: ActorMethod<[InitAssetKey, bigint], InitUploadResult>;
	init_proposal: ActorMethod<[ProposalType], [bigint, Proposal]>;
	init_user_mission_control_center: ActorMethod<[], MissionControl>;
	list_assets: ActorMethod<[string, ListParams], ListResults>;
	list_custom_domains: ActorMethod<[], Array<[string, CustomDomain]>>;
	list_payments: ActorMethod<[], Array<[bigint, Payment]>>;
	list_user_mission_control_centers: ActorMethod<[], Array<[Principal, MissionControl]>>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_custom_domain: ActorMethod<[string, [] | [string]], undefined>;
	set_fee: ActorMethod<[SegmentType, Tokens], undefined>;
	set_storage_config: ActorMethod<[StorageConfig], undefined>;
	submit_proposal: ActorMethod<[bigint], [bigint, Proposal]>;
	update_rate_config: ActorMethod<[SegmentType, RateConfig], undefined>;
	upload_asset_chunk: ActorMethod<[UploadChunk], UploadChunkResult>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

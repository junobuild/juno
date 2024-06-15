import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface AssertMissionControlCenterArgs {
	mission_control_id: Principal;
	user: Principal;
}
export interface BatchGroupProposal {
	status: BatchGroupProposalStatus;
	updated_at: bigint;
	sha256: Uint8Array | number[];
	executed_at: [] | [bigint];
	owner: Principal;
	created_at: bigint;
	version: [] | [bigint];
}
export type BatchGroupProposalStatus =
	| { Failed: null }
	| { Open: null }
	| { Rejected: null }
	| { Executed: null }
	| { Accepted: null };
export interface CommitBatch {
	batch_id: bigint;
	headers: Array<[string, string]>;
	chunk_ids: Array<bigint>;
}
export interface CommitBatchGroup {
	sha256: Uint8Array | number[];
	batch_group_id: bigint;
}
export interface Config {
	storage: StorageConfig;
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface CreateCanisterArgs {
	block_index: [] | [bigint];
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
export interface GetCreateCanisterFeeArgs {
	user: Principal;
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
export interface LoadRelease {
	total: bigint;
	chunks: bigint;
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
export interface RateConfig {
	max_tokens: bigint;
	time_per_token_ns: bigint;
}
export interface ReleasesVersion {
	satellite: [] | [string];
	orbiter: [] | [string];
	mission_control: [] | [string];
}
export type Segment = { Orbiter: null } | { MissionControl: null } | { Satellite: null };
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
export interface Tokens {
	e8s: bigint;
}
export interface UploadChunk {
	content: Uint8Array | number[];
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
	commit_assets_upload_group: ActorMethod<[CommitBatchGroup], undefined>;
	create_orbiter: ActorMethod<[CreateCanisterArgs], Principal>;
	create_satellite: ActorMethod<[CreateCanisterArgs], Principal>;
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	del_custom_domain: ActorMethod<[string], undefined>;
	get_config: ActorMethod<[], Config>;
	get_create_orbiter_fee: ActorMethod<[GetCreateCanisterFeeArgs], [] | [Tokens]>;
	get_create_satellite_fee: ActorMethod<[GetCreateCanisterFeeArgs], [] | [Tokens]>;
	get_credits: ActorMethod<[], Tokens>;
	get_releases_version: ActorMethod<[], ReleasesVersion>;
	get_user_mission_control_center: ActorMethod<[], [] | [MissionControl]>;
	http_request: ActorMethod<[HttpRequest], HttpResponse>;
	http_request_streaming_callback: ActorMethod<
		[StreamingCallbackToken],
		StreamingCallbackHttpResponse
	>;
	init_asset_upload: ActorMethod<[InitAssetKey, bigint], InitUploadResult>;
	init_assets_upload_group: ActorMethod<[], bigint>;
	init_user_mission_control_center: ActorMethod<[], MissionControl>;
	list_custom_domains: ActorMethod<[], Array<[string, CustomDomain]>>;
	list_payments: ActorMethod<[], Array<[bigint, Payment]>>;
	list_user_mission_control_centers: ActorMethod<[], Array<[Principal, MissionControl]>>;
	load_release: ActorMethod<[Segment, Uint8Array | number[], string], LoadRelease>;
	propose_assets_upload_group: ActorMethod<[bigint], [bigint, BatchGroupProposal]>;
	reset_release: ActorMethod<[Segment], undefined>;
	set_config: ActorMethod<[Config], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_custom_domain: ActorMethod<[string, [] | [string]], undefined>;
	set_fee: ActorMethod<[Segment, Tokens], undefined>;
	update_rate_config: ActorMethod<[Segment, RateConfig], undefined>;
	upload_asset_chunk: ActorMethod<[UploadChunk], UploadChunkResult>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

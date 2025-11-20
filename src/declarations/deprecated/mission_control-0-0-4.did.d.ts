import type { ActorMethod } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

export interface CanisterStatusResponse {
	status: CanisterStatusType;
	memory_size: bigint;
	cycles: bigint;
	settings: DefiniteCanisterSettings;
	idle_cycles_burned_per_day: bigint;
	module_hash: [] | [Uint8Array];
}
export type CanisterStatusType = { stopped: null } | { stopping: null } | { running: null };
export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	expires_at: [] | [bigint];
}
export interface CronJobStatusesSatelliteConfig {
	enabled: boolean;
	cycles_threshold: [] | [bigint];
}
export interface DefiniteCanisterSettings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export type Result = { Ok: SegmentStatus } | { Err: string };
export interface Satellite {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	satellite_id: Principal;
}
export interface SegmentStatus {
	id: Principal;
	status: CanisterStatusResponse;
	metadata: [] | [Array<[string, string]>];
	status_at: bigint;
}
export interface SegmentsStatuses {
	satellites: [] | [Array<Result>];
	mission_control: Result;
}
export interface SetController {
	metadata: Array<[string, string]>;
	expires_at: [] | [bigint];
}
export interface StatusesArgs {
	mission_control_cycles_threshold: [] | [bigint];
	satellites: Array<[Principal, CronJobStatusesSatelliteConfig]>;
	cycles_threshold: [] | [bigint];
}
export interface Tokens {
	e8s: bigint;
}
export interface _SERVICE {
	add_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	add_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	create_satellite: ActorMethod<[string], Satellite>;
	del_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	del_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	get_user: ActorMethod<[], Principal>;
	list_mission_control_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_mission_control_statuses: ActorMethod<[], Array<[bigint, Result]>>;
	list_satellite_statuses: ActorMethod<[Principal], [] | [Array<[bigint, Result]>]>;
	list_satellites: ActorMethod<[], Array<[Principal, Satellite]>>;
	remove_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	remove_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	set_metadata: ActorMethod<[Array<[string, string]>], undefined>;
	set_mission_control_controllers: ActorMethod<[Array<Principal>, SetController], undefined>;
	set_satellites_controllers: ActorMethod<
		[Array<Principal>, Array<Principal>, SetController],
		undefined
	>;
	status: ActorMethod<[StatusesArgs], SegmentsStatuses>;
	top_up: ActorMethod<[Principal, Tokens], undefined>;
	version: ActorMethod<[], string>;
}

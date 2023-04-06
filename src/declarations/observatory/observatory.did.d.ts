import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface CanisterStatusResponse {
	status: CanisterStatusType;
	memory_size: bigint;
	cycles: bigint;
	settings: DefiniteCanisterSettings;
	idle_cycles_burned_per_day: bigint;
	module_hash: [] | [Uint8Array | number[]];
}
export type CanisterStatusType = { stopped: null } | { stopping: null } | { running: null };
export interface CronJobs {
	metadata: Array<[string, string]>;
	statuses: StatusesCronJob;
}
export interface DefiniteCanisterSettings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface ListStatuses {
	metadata: Array<[string, string]>;
	statuses: Result_1;
	timestamp: bigint;
}
export type Result = { Ok: SegmentStatus } | { Err: string };
export type Result_1 = { Ok: SegmentsStatuses } | { Err: string };
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
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface SetCronJobsArgs {
	cron_jobs: CronJobs;
	mission_control_id: Principal;
}
export interface StatusesCronJob {
	enabled: boolean;
	cycles_threshold: bigint;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	del_cron_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	list_last_statuses: ActorMethod<[], Array<ListStatuses>>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_cron_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_cron_jobs: ActorMethod<[SetCronJobsArgs], undefined>;
	version: ActorMethod<[], string>;
}

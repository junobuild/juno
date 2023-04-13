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
export interface CollectStatuses {
	cron_jobs: CronJobs;
	statuses: Result_1;
	timestamp: bigint;
}
export interface CollectStatusesArgs {
	time_delta: [] | [bigint];
}
export interface CronJobStatuses {
	mission_control_cycles_threshold: [] | [bigint];
	satellites: Array<[Principal, CronJobStatusesSatelliteConfig]>;
	enabled: boolean;
	cycles_threshold: [] | [bigint];
}
export interface CronJobStatusesSatelliteConfig {
	enabled: boolean;
	cycles_threshold: [] | [bigint];
}
export interface CronJobs {
	metadata: Array<[string, string]>;
	statuses: CronJobStatuses;
}
export interface CronTab {
	cron_jobs: CronJobs;
	updated_at: bigint;
	mission_control_id: Principal;
	created_at: bigint;
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
export interface SetCronTab {
	cron_jobs: CronJobs;
	updated_at: [] | [bigint];
	mission_control_id: Principal;
}
export interface _SERVICE {
	collect_statuses: ActorMethod<[CollectStatusesArgs], Array<CollectStatuses>>;
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	del_cron_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	get_cron_tab: ActorMethod<[], [] | [CronTab]>;
	list_statuses: ActorMethod<[], [] | [Array<[bigint, Result_1]>]>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_cron_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_cron_tab: ActorMethod<[SetCronTab], CronTab>;
	version: ActorMethod<[], string>;
}

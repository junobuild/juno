import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export interface Account {
	owner: Principal;
	subaccount: [] | [Uint8Array | number[]];
}
export type CanisterStatusType = { stopped: null } | { stopping: null } | { running: null };
export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface CreateCanisterConfig {
	subnet_id: [] | [Principal];
	name: [] | [string];
}
export interface CronJobStatusesConfig {
	enabled: boolean;
	cycles_threshold: [] | [bigint];
}
export interface DepositCyclesArgs {
	cycles: bigint;
	destination_id: Principal;
}
export interface Orbiter {
	updated_at: bigint;
	orbiter_id: Principal;
	metadata: Array<[string, string]>;
	created_at: bigint;
}
export type Result = { Ok: bigint } | { Err: TransferError };
export type Result_1 = { Ok: bigint } | { Err: TransferError_1 };
export type Result_2 = { Ok: SegmentStatus } | { Err: string };
export interface Satellite {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	satellite_id: Principal;
}
export interface SegmentCanisterSettings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export interface SegmentCanisterStatus {
	status: CanisterStatusType;
	memory_size: bigint;
	cycles: bigint;
	settings: SegmentCanisterSettings;
	idle_cycles_burned_per_day: bigint;
	module_hash: [] | [Uint8Array | number[]];
}
export interface SegmentStatus {
	id: Principal;
	status: SegmentCanisterStatus;
	metadata: [] | [Array<[string, string]>];
	status_at: bigint;
}
export interface SegmentsStatuses {
	orbiters: [] | [Array<Result_2>];
	satellites: [] | [Array<Result_2>];
	mission_control: Result_2;
}
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface StatusesArgs {
	mission_control_cycles_threshold: [] | [bigint];
	orbiters: Array<[Principal, CronJobStatusesConfig]>;
	satellites: Array<[Principal, CronJobStatusesConfig]>;
	cycles_threshold: [] | [bigint];
}
export interface Timestamp {
	timestamp_nanos: bigint;
}
export interface Tokens {
	e8s: bigint;
}
export interface TransferArg {
	to: Account;
	fee: [] | [bigint];
	memo: [] | [Uint8Array | number[]];
	from_subaccount: [] | [Uint8Array | number[]];
	created_at_time: [] | [bigint];
	amount: bigint;
}
export interface TransferArgs {
	to: Uint8Array | number[];
	fee: Tokens;
	memo: bigint;
	from_subaccount: [] | [Uint8Array | number[]];
	created_at_time: [] | [Timestamp];
	amount: Tokens;
}
export type TransferError =
	| {
			TxTooOld: { allowed_window_nanos: bigint };
	  }
	| { BadFee: { expected_fee: Tokens } }
	| { TxDuplicate: { duplicate_of: bigint } }
	| { TxCreatedInFuture: null }
	| { InsufficientFunds: { balance: Tokens } };
export type TransferError_1 =
	| {
			GenericError: { message: string; error_code: bigint };
	  }
	| { TemporarilyUnavailable: null }
	| { BadBurn: { min_burn_amount: bigint } }
	| { Duplicate: { duplicate_of: bigint } }
	| { BadFee: { expected_fee: bigint } }
	| { CreatedInFuture: { ledger_time: bigint } }
	| { TooOld: null }
	| { InsufficientFunds: { balance: bigint } };
export interface _SERVICE {
	add_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	add_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	create_orbiter: ActorMethod<[[] | [string]], Orbiter>;
	create_orbiter_with_config: ActorMethod<[CreateCanisterConfig], Orbiter>;
	create_satellite: ActorMethod<[string], Satellite>;
	create_satellite_with_config: ActorMethod<[CreateCanisterConfig], Satellite>;
	del_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	del_orbiter: ActorMethod<[Principal, bigint], undefined>;
	del_orbiters_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	del_satellite: ActorMethod<[Principal, bigint], undefined>;
	del_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	deposit_cycles: ActorMethod<[DepositCyclesArgs], undefined>;
	get_user: ActorMethod<[], Principal>;
	icp_transfer: ActorMethod<[TransferArgs], Result>;
	icrc_transfer: ActorMethod<[Principal, TransferArg], Result_1>;
	list_mission_control_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	list_mission_control_statuses: ActorMethod<[], Array<[bigint, Result_2]>>;
	list_orbiter_statuses: ActorMethod<[Principal], [] | [Array<[bigint, Result_2]>]>;
	list_orbiters: ActorMethod<[], Array<[Principal, Orbiter]>>;
	list_satellite_statuses: ActorMethod<[Principal], [] | [Array<[bigint, Result_2]>]>;
	list_satellites: ActorMethod<[], Array<[Principal, Satellite]>>;
	remove_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	remove_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	set_metadata: ActorMethod<[Array<[string, string]>], undefined>;
	set_mission_control_controllers: ActorMethod<[Array<Principal>, SetController], undefined>;
	set_orbiter: ActorMethod<[Principal, [] | [string]], Orbiter>;
	set_orbiter_metadata: ActorMethod<[Principal, Array<[string, string]>], Orbiter>;
	set_orbiters_controllers: ActorMethod<
		[Array<Principal>, Array<Principal>, SetController],
		undefined
	>;
	set_satellite: ActorMethod<[Principal, [] | [string]], Satellite>;
	set_satellite_metadata: ActorMethod<[Principal, Array<[string, string]>], Satellite>;
	set_satellites_controllers: ActorMethod<
		[Array<Principal>, Array<Principal>, SetController],
		undefined
	>;
	status: ActorMethod<[StatusesArgs], SegmentsStatuses>;
	top_up: ActorMethod<[Principal, Tokens], undefined>;
	unset_orbiter: ActorMethod<[Principal], undefined>;
	unset_satellite: ActorMethod<[Principal], undefined>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

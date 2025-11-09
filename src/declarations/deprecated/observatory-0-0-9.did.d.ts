import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export type ControllerScope = { Write: null } | { Admin: null };
export interface CyclesBalance {
	timestamp: bigint;
	amount: bigint;
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface DepositedCyclesEmailNotification {
	to: string;
	deposited_cycles: CyclesBalance;
}
export interface Env {
	email_api_key: [] | [string];
}
export interface GetNotifications {
	to: [] | [bigint];
	from: [] | [bigint];
	segment_id: [] | [Principal];
}
export type NotificationKind = {
	DepositedCyclesEmail: DepositedCyclesEmailNotification;
};
export interface NotifyArgs {
	kind: NotificationKind;
	user: Principal;
	segment: Segment;
}
export interface NotifyStatus {
	pending: bigint;
	sent: bigint;
	failed: bigint;
}
export interface Segment {
	id: Principal;
	metadata: [] | [Array<[string, string]>];
	kind: SegmentKind;
}
export type SegmentKind = { Orbiter: null } | { MissionControl: null } | { Satellite: null };
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	get_notify_status: ActorMethod<[GetNotifications], NotifyStatus>;
	list_controllers: ActorMethod<[], Array<[Principal, Controller]>>;
	notify: ActorMethod<[NotifyArgs], undefined>;
	ping: ActorMethod<[NotifyArgs], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_env: ActorMethod<[Env], undefined>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

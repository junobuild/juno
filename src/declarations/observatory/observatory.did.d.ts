import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export type ControllerScope = { Write: null } | { Admin: null };
export interface CyclesBalance {
	timestamp: bigint;
	amount: bigint;
}
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
}
export interface Env {
	email_api_key: [] | [string];
}
export interface HttpHeader {
	value: string;
	name: string;
}
export interface HttpResponse {
	status: bigint;
	body: Uint8Array | number[];
	headers: Array<HttpHeader>;
}
export interface NotifyArgs {
	user: Principal;
	segment_id: Principal;
	notification: SendNotification;
}
export interface SendDepositedCyclesEmailNotification {
	to: string;
	deposited_cycles: CyclesBalance;
	metadata: [] | [Array<[string, string]>];
}
export type SendNotification = {
	DepositedCyclesEmail: SendDepositedCyclesEmailNotification;
};
export interface SetController {
	metadata: Array<[string, string]>;
	scope: ControllerScope;
	expires_at: [] | [bigint];
}
export interface SetControllersArgs {
	controller: SetController;
	controllers: Array<Principal>;
}
export interface TransformArgs {
	context: Uint8Array | number[];
	response: HttpResponse;
}
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	notify: ActorMethod<[NotifyArgs], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	set_env: ActorMethod<[Env], undefined>;
	transform: ActorMethod<[TransformArgs], HttpResponse>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export type ControllerScope = { Write: null } | { Admin: null };
export interface DeleteControllersArgs {
	controllers: Array<Principal>;
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
export interface _SERVICE {
	del_controllers: ActorMethod<[DeleteControllersArgs], undefined>;
	set_controllers: ActorMethod<[SetControllersArgs], undefined>;
	version: ActorMethod<[], string>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

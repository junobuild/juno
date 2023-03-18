import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface Controller {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	expires_at: [] | [bigint];
}
export interface Satellite {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	satellite_id: Principal;
}
export interface SetController {
	metadata: Array<[string, string]>;
	expires_at: [] | [bigint];
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
	list_satellites: ActorMethod<[], Array<[Principal, Satellite]>>;
	remove_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	remove_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	set_mission_control_controllers: ActorMethod<[Array<Principal>, SetController], undefined>;
	set_satellites_controllers: ActorMethod<
		[Array<Principal>, Array<Principal>, SetController],
		undefined
	>;
	top_up: ActorMethod<[Principal, Tokens], undefined>;
	version: ActorMethod<[], string>;
}

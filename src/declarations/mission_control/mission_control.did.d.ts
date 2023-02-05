import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface Satellite {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	satellite_id: Principal;
}
export interface Tokens {
	e8s: bigint;
}
export interface _SERVICE {
	add_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	add_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	create_satellite: ActorMethod<[string], Satellite>;
	get_user: ActorMethod<[], Principal>;
	list_mission_control_controllers: ActorMethod<[], Array<Principal>>;
	list_satellites: ActorMethod<[], Array<[Principal, Satellite]>>;
	remove_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	remove_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	top_up: ActorMethod<[Principal, Tokens], undefined>;
	version: ActorMethod<[], string>;
}

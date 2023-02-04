import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type Operation =
	| {
			Burn: { from: Uint8Array; amount: Tokens };
	  }
	| { Mint: { to: Uint8Array; amount: Tokens } }
	| {
			Transfer: {
				to: Uint8Array;
				fee: Tokens;
				from: Uint8Array;
				amount: Tokens;
			};
	  };
export interface Satellite {
	updated_at: bigint;
	metadata: Array<[string, string]>;
	created_at: bigint;
	satellite_id: Principal;
}
export interface Timestamp {
	timestamp_nanos: bigint;
}
export interface Tokens {
	e8s: bigint;
}
export interface Transaction {
	block_index: bigint;
	memo: bigint;
	operation: [] | [Operation];
	timestamp: Timestamp;
}
export interface _SERVICE {
	add_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	add_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	create_satellite: ActorMethod<[string], Satellite>;
	get_user: ActorMethod<[], Principal>;
	list_mission_control_controllers: ActorMethod<[], Array<Principal>>;
	list_satellites: ActorMethod<[], Array<[Principal, Satellite]>>;
	list_transactions: ActorMethod<[], Array<Transaction>>;
	remove_mission_control_controllers: ActorMethod<[Array<Principal>], undefined>;
	remove_satellites_controllers: ActorMethod<[Array<Principal>, Array<Principal>], undefined>;
	top_up: ActorMethod<[Principal, Tokens], undefined>;
	version: ActorMethod<[], string>;
}

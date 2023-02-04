import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export interface ListTransactionsArgs {
	account_identifier: Uint8Array;
}
export interface ObservatoryAddMissionControlArgs {
	mission_control_id: Principal;
	owner: Principal;
}
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
	add_mission_control: ActorMethod<[ObservatoryAddMissionControlArgs], undefined>;
	list_transactions: ActorMethod<[ListTransactionsArgs], Array<Transaction>>;
	version: ActorMethod<[], string>;
}

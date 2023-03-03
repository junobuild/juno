import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type BlockIndex = bigint;
export type Cycles = bigint;
export interface CyclesCanisterInitPayload {
	last_purged_notification: [] | [BlockIndex];
	governance_canister_id: Principal;
	minting_account_id: [] | [string];
	ledger_canister_id: Principal;
}
export interface IcpXdrConversionRate {
	xdr_permyriad_per_icp: bigint;
	timestamp_seconds: bigint;
}
export interface IcpXdrConversionRateResponse {
	certificate: Uint8Array | number[];
	data: IcpXdrConversionRate;
	hash_tree: Uint8Array | number[];
}
export interface NotifyCreateCanisterArg {
	controller: Principal;
	block_index: BlockIndex;
	subnet_type: [] | [string];
}
export type NotifyCreateCanisterResult = { Ok: Principal } | { Err: NotifyError };
export type NotifyError =
	| {
			Refunded: { block_index: [] | [BlockIndex]; reason: string };
	  }
	| { InvalidTransaction: string }
	| { Other: { error_message: string; error_code: bigint } }
	| { Processing: null }
	| { TransactionTooOld: BlockIndex };
export interface NotifyTopUpArg {
	block_index: BlockIndex;
	canister_id: Principal;
}
export type NotifyTopUpResult = { Ok: Cycles } | { Err: NotifyError };
export interface SubnetTypesToSubnetsResponse {
	data: Array<[string, Array<Principal>]>;
}
export interface _SERVICE {
	get_icp_xdr_conversion_rate: ActorMethod<[], IcpXdrConversionRateResponse>;
	get_subnet_types_to_subnets: ActorMethod<[], SubnetTypesToSubnetsResponse>;
	notify_create_canister: ActorMethod<[NotifyCreateCanisterArg], NotifyCreateCanisterResult>;
	notify_top_up: ActorMethod<[NotifyTopUpArg], NotifyTopUpResult>;
}

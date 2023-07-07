import type { ActorMethod } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export type bitcoin_address = string;
export type bitcoin_network = { mainnet: null } | { testnet: null };
export type block_hash = Uint8Array;
export type canister_id = Principal;
export interface canister_settings {
	freezing_threshold: [] | [bigint];
	controllers: [] | [Array<Principal>];
	memory_allocation: [] | [bigint];
	compute_allocation: [] | [bigint];
}
export interface change {
	timestamp_nanos: bigint;
	canister_version: bigint;
	origin: change_origin;
	details: change_details;
}
export type change_details =
	| {
			creation: { controllers: Array<Principal> };
	  }
	| {
			code_deployment: {
				mode: { reinstall: null } | { upgrade: null } | { install: null };
				module_hash: Uint8Array;
			};
	  }
	| { controllers_change: { controllers: Array<Principal> } }
	| { code_uninstall: null };
export type change_origin =
	| { from_user: { user_id: Principal } }
	| {
			from_canister: {
				canister_version: [] | [bigint];
				canister_id: Principal;
			};
	  };
export interface definite_canister_settings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export type ecdsa_curve = { secp256k1: null };
export interface get_balance_request {
	network: bitcoin_network;
	address: bitcoin_address;
	min_confirmations: [] | [number];
}
export interface get_current_fee_percentiles_request {
	network: bitcoin_network;
}
export interface get_utxos_request {
	network: bitcoin_network;
	filter: [] | [{ page: Uint8Array } | { min_confirmations: number }];
	address: bitcoin_address;
}
export interface get_utxos_response {
	next_page: [] | [Uint8Array];
	tip_height: number;
	tip_block_hash: block_hash;
	utxos: Array<utxo>;
}
export interface http_header {
	value: string;
	name: string;
}
export interface http_response {
	status: bigint;
	body: Uint8Array;
	headers: Array<http_header>;
}
export type millisatoshi_per_byte = bigint;
export interface outpoint {
	txid: Uint8Array;
	vout: number;
}
export type satoshi = bigint;
export interface send_transaction_request {
	transaction: Uint8Array;
	network: bitcoin_network;
}
export interface utxo {
	height: number;
	value: satoshi;
	outpoint: outpoint;
}
export type wasm_module = Uint8Array;
export interface _SERVICE {
	bitcoin_get_balance: ActorMethod<[get_balance_request], satoshi>;
	bitcoin_get_current_fee_percentiles: ActorMethod<
		[get_current_fee_percentiles_request],
		BigUint64Array
	>;
	bitcoin_get_utxos: ActorMethod<[get_utxos_request], get_utxos_response>;
	bitcoin_send_transaction: ActorMethod<[send_transaction_request], undefined>;
	canister_info: ActorMethod<
		[{ canister_id: canister_id; num_requested_changes: [] | [bigint] }],
		{
			controllers: Array<Principal>;
			module_hash: [] | [Uint8Array];
			recent_changes: Array<change>;
			total_num_changes: bigint;
		}
	>;
	canister_status: ActorMethod<
		[{ canister_id: canister_id }],
		{
			status: { stopped: null } | { stopping: null } | { running: null };
			memory_size: bigint;
			cycles: bigint;
			settings: definite_canister_settings;
			idle_cycles_burned_per_day: bigint;
			module_hash: [] | [Uint8Array];
		}
	>;
	create_canister: ActorMethod<
		[
			{
				settings: [] | [canister_settings];
				sender_canister_version: [] | [bigint];
			}
		],
		{ canister_id: canister_id }
	>;
	delete_canister: ActorMethod<[{ canister_id: canister_id }], undefined>;
	deposit_cycles: ActorMethod<[{ canister_id: canister_id }], undefined>;
	ecdsa_public_key: ActorMethod<
		[
			{
				key_id: { name: string; curve: ecdsa_curve };
				canister_id: [] | [canister_id];
				derivation_path: Array<Uint8Array>;
			}
		],
		{ public_key: Uint8Array; chain_code: Uint8Array }
	>;
	http_request: ActorMethod<
		[
			{
				url: string;
				method: { get: null } | { head: null } | { post: null };
				max_response_bytes: [] | [bigint];
				body: [] | [Uint8Array];
				transform: [] | [{ function: [Principal, string]; context: Uint8Array }];
				headers: Array<http_header>;
			}
		],
		http_response
	>;
	install_code: ActorMethod<
		[
			{
				arg: Uint8Array;
				wasm_module: wasm_module;
				mode: { reinstall: null } | { upgrade: null } | { install: null };
				canister_id: canister_id;
				sender_canister_version: [] | [bigint];
			}
		],
		undefined
	>;
	provisional_create_canister_with_cycles: ActorMethod<
		[
			{
				settings: [] | [canister_settings];
				specified_id: [] | [canister_id];
				amount: [] | [bigint];
			}
		],
		{ canister_id: canister_id }
	>;
	provisional_top_up_canister: ActorMethod<
		[{ canister_id: canister_id; amount: bigint }],
		undefined
	>;
	raw_rand: ActorMethod<[], Uint8Array>;
	sign_with_ecdsa: ActorMethod<
		[
			{
				key_id: { name: string; curve: ecdsa_curve };
				derivation_path: Array<Uint8Array>;
				message_hash: Uint8Array;
			}
		],
		{ signature: Uint8Array }
	>;
	start_canister: ActorMethod<[{ canister_id: canister_id }], undefined>;
	stop_canister: ActorMethod<[{ canister_id: canister_id }], undefined>;
	uninstall_code: ActorMethod<
		[
			{
				canister_id: canister_id;
				sender_canister_version: [] | [bigint];
			}
		],
		undefined
	>;
	update_settings: ActorMethod<
		[
			{
				canister_id: Principal;
				settings: canister_settings;
				sender_canister_version: [] | [bigint];
			}
		],
		undefined
	>;
}

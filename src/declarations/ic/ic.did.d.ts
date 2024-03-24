import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export type bitcoin_address = string;
export interface bitcoin_get_balance_args {
	network: bitcoin_network;
	address: bitcoin_address;
	min_confirmations: [] | [number];
}
export interface bitcoin_get_balance_query_args {
	network: bitcoin_network;
	address: bitcoin_address;
	min_confirmations: [] | [number];
}
export type bitcoin_get_balance_query_result = satoshi;
export type bitcoin_get_balance_result = satoshi;
export interface bitcoin_get_current_fee_percentiles_args {
	network: bitcoin_network;
}
export type bitcoin_get_current_fee_percentiles_result = BigUint64Array | bigint[];
export interface bitcoin_get_utxos_args {
	network: bitcoin_network;
	filter: [] | [{ page: Uint8Array | number[] } | { min_confirmations: number }];
	address: bitcoin_address;
}
export interface bitcoin_get_utxos_query_args {
	network: bitcoin_network;
	filter: [] | [{ page: Uint8Array | number[] } | { min_confirmations: number }];
	address: bitcoin_address;
}
export interface bitcoin_get_utxos_query_result {
	next_page: [] | [Uint8Array | number[]];
	tip_height: number;
	tip_block_hash: block_hash;
	utxos: Array<utxo>;
}
export interface bitcoin_get_utxos_result {
	next_page: [] | [Uint8Array | number[]];
	tip_height: number;
	tip_block_hash: block_hash;
	utxos: Array<utxo>;
}
export type bitcoin_network = { mainnet: null } | { testnet: null };
export interface bitcoin_send_transaction_args {
	transaction: Uint8Array | number[];
	network: bitcoin_network;
}
export type block_hash = Uint8Array | number[];
export type canister_id = Principal;
export interface canister_info_args {
	canister_id: canister_id;
	num_requested_changes: [] | [bigint];
}
export interface canister_info_result {
	controllers: Array<Principal>;
	module_hash: [] | [Uint8Array | number[]];
	recent_changes: Array<change>;
	total_num_changes: bigint;
}
export interface canister_log_record {
	idx: bigint;
	timestamp_nanos: bigint;
	content: Uint8Array | number[];
}
export interface canister_settings {
	freezing_threshold: [] | [bigint];
	controllers: [] | [Array<Principal>];
	reserved_cycles_limit: [] | [bigint];
	log_visibility: [] | [log_visibility];
	memory_allocation: [] | [bigint];
	compute_allocation: [] | [bigint];
}
export interface canister_status_args {
	canister_id: canister_id;
}
export interface canister_status_result {
	status: { stopped: null } | { stopping: null } | { running: null };
	memory_size: bigint;
	cycles: bigint;
	settings: definite_canister_settings;
	idle_cycles_burned_per_day: bigint;
	module_hash: [] | [Uint8Array | number[]];
	reserved_cycles: bigint;
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
				module_hash: Uint8Array | number[];
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
export type chunk_hash = Uint8Array | number[];
export interface clear_chunk_store_args {
	canister_id: canister_id;
}
export interface create_canister_args {
	settings: [] | [canister_settings];
	sender_canister_version: [] | [bigint];
}
export interface create_canister_result {
	canister_id: canister_id;
}
export interface definite_canister_settings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	reserved_cycles_limit: bigint;
	log_visibility: log_visibility;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export interface delete_canister_args {
	canister_id: canister_id;
}
export interface deposit_cycles_args {
	canister_id: canister_id;
}
export type ecdsa_curve = { secp256k1: null };
export interface ecdsa_public_key_args {
	key_id: { name: string; curve: ecdsa_curve };
	canister_id: [] | [canister_id];
	derivation_path: Array<Uint8Array | number[]>;
}
export interface ecdsa_public_key_result {
	public_key: Uint8Array | number[];
	chain_code: Uint8Array | number[];
}
export interface fetch_canister_logs_args {
	canister_id: canister_id;
}
export interface fetch_canister_logs_result {
	canister_log_records: Array<canister_log_record>;
}
export interface http_header {
	value: string;
	name: string;
}
export interface http_request_args {
	url: string;
	method: { get: null } | { head: null } | { post: null };
	max_response_bytes: [] | [bigint];
	body: [] | [Uint8Array | number[]];
	transform: [] | [{ function: [Principal, string]; context: Uint8Array | number[] }];
	headers: Array<http_header>;
}
export interface http_request_result {
	status: bigint;
	body: Uint8Array | number[];
	headers: Array<http_header>;
}
export interface install_chunked_code_args {
	arg: Uint8Array | number[];
	wasm_module_hash: Uint8Array | number[];
	mode:
		| { reinstall: null }
		| { upgrade: [] | [{ skip_pre_upgrade: [] | [boolean] }] }
		| { install: null };
	chunk_hashes_list: Array<chunk_hash>;
	target_canister: canister_id;
	sender_canister_version: [] | [bigint];
	storage_canister: [] | [canister_id];
}
export interface install_code_args {
	arg: Uint8Array | number[];
	wasm_module: wasm_module;
	mode:
		| { reinstall: null }
		| { upgrade: [] | [{ skip_pre_upgrade: [] | [boolean] }] }
		| { install: null };
	canister_id: canister_id;
	sender_canister_version: [] | [bigint];
}
export type log_visibility = { controllers: null } | { public: null };
export type millisatoshi_per_byte = bigint;
export interface node_metrics {
	num_block_failures_total: bigint;
	node_id: Principal;
	num_blocks_total: bigint;
}
export interface node_metrics_history_args {
	start_at_timestamp_nanos: bigint;
	subnet_id: Principal;
}
export type node_metrics_history_result = Array<{
	timestamp_nanos: bigint;
	node_metrics: Array<node_metrics>;
}>;
export interface outpoint {
	txid: Uint8Array | number[];
	vout: number;
}
export interface provisional_create_canister_with_cycles_args {
	settings: [] | [canister_settings];
	specified_id: [] | [canister_id];
	amount: [] | [bigint];
	sender_canister_version: [] | [bigint];
}
export interface provisional_create_canister_with_cycles_result {
	canister_id: canister_id;
}
export interface provisional_top_up_canister_args {
	canister_id: canister_id;
	amount: bigint;
}
export type raw_rand_result = Uint8Array | number[];
export type satoshi = bigint;
export interface sign_with_ecdsa_args {
	key_id: { name: string; curve: ecdsa_curve };
	derivation_path: Array<Uint8Array | number[]>;
	message_hash: Uint8Array | number[];
}
export interface sign_with_ecdsa_result {
	signature: Uint8Array | number[];
}
export interface start_canister_args {
	canister_id: canister_id;
}
export interface stop_canister_args {
	canister_id: canister_id;
}
export interface stored_chunks_args {
	canister_id: canister_id;
}
export type stored_chunks_result = Array<chunk_hash>;
export interface uninstall_code_args {
	canister_id: canister_id;
	sender_canister_version: [] | [bigint];
}
export interface update_settings_args {
	canister_id: Principal;
	settings: canister_settings;
	sender_canister_version: [] | [bigint];
}
export interface upload_chunk_args {
	chunk: Uint8Array | number[];
	canister_id: Principal;
}
export type upload_chunk_result = chunk_hash;
export interface utxo {
	height: number;
	value: satoshi;
	outpoint: outpoint;
}
export type wasm_module = Uint8Array | number[];
export interface _SERVICE {
	bitcoin_get_balance: ActorMethod<[bitcoin_get_balance_args], bitcoin_get_balance_result>;
	bitcoin_get_balance_query: ActorMethod<
		[bitcoin_get_balance_query_args],
		bitcoin_get_balance_query_result
	>;
	bitcoin_get_current_fee_percentiles: ActorMethod<
		[bitcoin_get_current_fee_percentiles_args],
		bitcoin_get_current_fee_percentiles_result
	>;
	bitcoin_get_utxos: ActorMethod<[bitcoin_get_utxos_args], bitcoin_get_utxos_result>;
	bitcoin_get_utxos_query: ActorMethod<
		[bitcoin_get_utxos_query_args],
		bitcoin_get_utxos_query_result
	>;
	bitcoin_send_transaction: ActorMethod<[bitcoin_send_transaction_args], undefined>;
	canister_info: ActorMethod<[canister_info_args], canister_info_result>;
	canister_status: ActorMethod<[canister_status_args], canister_status_result>;
	clear_chunk_store: ActorMethod<[clear_chunk_store_args], undefined>;
	create_canister: ActorMethod<[create_canister_args], create_canister_result>;
	delete_canister: ActorMethod<[delete_canister_args], undefined>;
	deposit_cycles: ActorMethod<[deposit_cycles_args], undefined>;
	ecdsa_public_key: ActorMethod<[ecdsa_public_key_args], ecdsa_public_key_result>;
	fetch_canister_logs: ActorMethod<[fetch_canister_logs_args], fetch_canister_logs_result>;
	http_request: ActorMethod<[http_request_args], http_request_result>;
	install_chunked_code: ActorMethod<[install_chunked_code_args], undefined>;
	install_code: ActorMethod<[install_code_args], undefined>;
	node_metrics_history: ActorMethod<[node_metrics_history_args], node_metrics_history_result>;
	provisional_create_canister_with_cycles: ActorMethod<
		[provisional_create_canister_with_cycles_args],
		provisional_create_canister_with_cycles_result
	>;
	provisional_top_up_canister: ActorMethod<[provisional_top_up_canister_args], undefined>;
	raw_rand: ActorMethod<[], raw_rand_result>;
	sign_with_ecdsa: ActorMethod<[sign_with_ecdsa_args], sign_with_ecdsa_result>;
	start_canister: ActorMethod<[start_canister_args], undefined>;
	stop_canister: ActorMethod<[stop_canister_args], undefined>;
	stored_chunks: ActorMethod<[stored_chunks_args], stored_chunks_result>;
	uninstall_code: ActorMethod<[uninstall_code_args], undefined>;
	update_settings: ActorMethod<[update_settings_args], undefined>;
	upload_chunk: ActorMethod<[upload_chunk_args], upload_chunk_result>;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

import type { Principal } from '@dfinity/principal';
export type canister_id = Principal;
export interface canister_settings {
	freezing_threshold: [] | [bigint];
	controllers: [] | [Array<Principal>];
	memory_allocation: [] | [bigint];
	compute_allocation: [] | [bigint];
}
export interface definite_canister_settings {
	freezing_threshold: bigint;
	controllers: Array<Principal>;
	memory_allocation: bigint;
	compute_allocation: bigint;
}
export interface http_header {
	value: string;
	name: string;
}
export type http_request_error =
	| { dns_error: null }
	| { no_consensus: null }
	| { transform_error: null }
	| { unreachable: null }
	| { bad_tls: null }
	| { conn_timeout: null }
	| { invalid_url: null }
	| { timeout: null };
export interface http_response {
	status: bigint;
	body: Array<number>;
	headers: Array<http_header>;
}
export type user_id = Principal;
export type wasm_module = Array<number>;
export interface _SERVICE {
	canister_status: (arg_0: { canister_id: canister_id }) => Promise<{
		status: { stopped: null } | { stopping: null } | { running: null };
		memory_size: bigint;
		cycles: bigint;
		settings: definite_canister_settings;
		module_hash: [] | [Array<number>];
	}>;
	create_canister: (arg_0: {
		settings: [] | [canister_settings];
	}) => Promise<{ canister_id: canister_id }>;
	delete_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
	deposit_cycles: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
	http_request: (arg_0: {
		url: string;
		method: { get: null };
		body: [] | [Array<number>];
		transform: [] | [{ function: [Principal, string] }];
		headers: Array<http_header>;
	}) => Promise<{ Ok: http_response } | { Err: [] | [http_request_error] }>;
	install_code: (arg_0: {
		arg: Array<number>;
		wasm_module: wasm_module;
		mode: { reinstall: null } | { upgrade: null } | { install: null };
		canister_id: canister_id;
	}) => Promise<undefined>;
	provisional_create_canister_with_cycles: (arg_0: {
		settings: [] | [canister_settings];
		amount: [] | [bigint];
	}) => Promise<{ canister_id: canister_id }>;
	provisional_top_up_canister: (arg_0: {
		canister_id: canister_id;
		amount: bigint;
	}) => Promise<undefined>;
	raw_rand: () => Promise<Array<number>>;
	start_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
	stop_canister: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
	uninstall_code: (arg_0: { canister_id: canister_id }) => Promise<undefined>;
	update_settings: (arg_0: {
		canister_id: Principal;
		settings: canister_settings;
	}) => Promise<undefined>;
}

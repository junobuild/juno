// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const bitcoin_network = IDL.Variant({
		mainnet: IDL.Null,
		testnet: IDL.Null
	});
	const bitcoin_address = IDL.Text;
	const bitcoin_get_balance_args = IDL.Record({
		network: bitcoin_network,
		address: bitcoin_address,
		min_confirmations: IDL.Opt(IDL.Nat32)
	});
	const satoshi = IDL.Nat64;
	const bitcoin_get_balance_result = satoshi;
	const bitcoin_get_balance_query_args = IDL.Record({
		network: bitcoin_network,
		address: bitcoin_address,
		min_confirmations: IDL.Opt(IDL.Nat32)
	});
	const bitcoin_get_balance_query_result = satoshi;
	const bitcoin_get_current_fee_percentiles_args = IDL.Record({
		network: bitcoin_network
	});
	const millisatoshi_per_byte = IDL.Nat64;
	const bitcoin_get_current_fee_percentiles_result = IDL.Vec(millisatoshi_per_byte);
	const bitcoin_get_utxos_args = IDL.Record({
		network: bitcoin_network,
		filter: IDL.Opt(
			IDL.Variant({
				page: IDL.Vec(IDL.Nat8),
				min_confirmations: IDL.Nat32
			})
		),
		address: bitcoin_address
	});
	const block_hash = IDL.Vec(IDL.Nat8);
	const outpoint = IDL.Record({
		txid: IDL.Vec(IDL.Nat8),
		vout: IDL.Nat32
	});
	const utxo = IDL.Record({
		height: IDL.Nat32,
		value: satoshi,
		outpoint: outpoint
	});
	const bitcoin_get_utxos_result = IDL.Record({
		next_page: IDL.Opt(IDL.Vec(IDL.Nat8)),
		tip_height: IDL.Nat32,
		tip_block_hash: block_hash,
		utxos: IDL.Vec(utxo)
	});
	const bitcoin_get_utxos_query_args = IDL.Record({
		network: bitcoin_network,
		filter: IDL.Opt(
			IDL.Variant({
				page: IDL.Vec(IDL.Nat8),
				min_confirmations: IDL.Nat32
			})
		),
		address: bitcoin_address
	});
	const bitcoin_get_utxos_query_result = IDL.Record({
		next_page: IDL.Opt(IDL.Vec(IDL.Nat8)),
		tip_height: IDL.Nat32,
		tip_block_hash: block_hash,
		utxos: IDL.Vec(utxo)
	});
	const bitcoin_send_transaction_args = IDL.Record({
		transaction: IDL.Vec(IDL.Nat8),
		network: bitcoin_network
	});
	const canister_id = IDL.Principal;
	const canister_info_args = IDL.Record({
		canister_id: canister_id,
		num_requested_changes: IDL.Opt(IDL.Nat64)
	});
	const change_origin = IDL.Variant({
		from_user: IDL.Record({ user_id: IDL.Principal }),
		from_canister: IDL.Record({
			canister_version: IDL.Opt(IDL.Nat64),
			canister_id: IDL.Principal
		})
	});
	const change_details = IDL.Variant({
		creation: IDL.Record({ controllers: IDL.Vec(IDL.Principal) }),
		code_deployment: IDL.Record({
			mode: IDL.Variant({
				reinstall: IDL.Null,
				upgrade: IDL.Null,
				install: IDL.Null
			}),
			module_hash: IDL.Vec(IDL.Nat8)
		}),
		controllers_change: IDL.Record({
			controllers: IDL.Vec(IDL.Principal)
		}),
		code_uninstall: IDL.Null
	});
	const change = IDL.Record({
		timestamp_nanos: IDL.Nat64,
		canister_version: IDL.Nat64,
		origin: change_origin,
		details: change_details
	});
	const canister_info_result = IDL.Record({
		controllers: IDL.Vec(IDL.Principal),
		module_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
		recent_changes: IDL.Vec(change),
		total_num_changes: IDL.Nat64
	});
	const canister_status_args = IDL.Record({ canister_id: canister_id });
	const log_visibility = IDL.Variant({
		controllers: IDL.Null,
		public: IDL.Null
	});
	const definite_canister_settings = IDL.Record({
		freezing_threshold: IDL.Nat,
		controllers: IDL.Vec(IDL.Principal),
		reserved_cycles_limit: IDL.Nat,
		log_visibility: log_visibility,
		memory_allocation: IDL.Nat,
		compute_allocation: IDL.Nat
	});
	const canister_status_result = IDL.Record({
		status: IDL.Variant({
			stopped: IDL.Null,
			stopping: IDL.Null,
			running: IDL.Null
		}),
		memory_size: IDL.Nat,
		cycles: IDL.Nat,
		settings: definite_canister_settings,
		idle_cycles_burned_per_day: IDL.Nat,
		module_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
		reserved_cycles: IDL.Nat
	});
	const clear_chunk_store_args = IDL.Record({ canister_id: canister_id });
	const canister_settings = IDL.Record({
		freezing_threshold: IDL.Opt(IDL.Nat),
		controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
		reserved_cycles_limit: IDL.Opt(IDL.Nat),
		log_visibility: IDL.Opt(log_visibility),
		memory_allocation: IDL.Opt(IDL.Nat),
		compute_allocation: IDL.Opt(IDL.Nat)
	});
	const create_canister_args = IDL.Record({
		settings: IDL.Opt(canister_settings),
		sender_canister_version: IDL.Opt(IDL.Nat64)
	});
	const create_canister_result = IDL.Record({ canister_id: canister_id });
	const delete_canister_args = IDL.Record({ canister_id: canister_id });
	const deposit_cycles_args = IDL.Record({ canister_id: canister_id });
	const ecdsa_curve = IDL.Variant({ secp256k1: IDL.Null });
	const ecdsa_public_key_args = IDL.Record({
		key_id: IDL.Record({ name: IDL.Text, curve: ecdsa_curve }),
		canister_id: IDL.Opt(canister_id),
		derivation_path: IDL.Vec(IDL.Vec(IDL.Nat8))
	});
	const ecdsa_public_key_result = IDL.Record({
		public_key: IDL.Vec(IDL.Nat8),
		chain_code: IDL.Vec(IDL.Nat8)
	});
	const fetch_canister_logs_args = IDL.Record({ canister_id: canister_id });
	const canister_log_record = IDL.Record({
		idx: IDL.Nat64,
		timestamp_nanos: IDL.Nat64,
		content: IDL.Vec(IDL.Nat8)
	});
	const fetch_canister_logs_result = IDL.Record({
		canister_log_records: IDL.Vec(canister_log_record)
	});
	const http_header = IDL.Record({ value: IDL.Text, name: IDL.Text });
	const http_request_result = IDL.Record({
		status: IDL.Nat,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(http_header)
	});
	const http_request_args = IDL.Record({
		url: IDL.Text,
		method: IDL.Variant({
			get: IDL.Null,
			head: IDL.Null,
			post: IDL.Null
		}),
		max_response_bytes: IDL.Opt(IDL.Nat64),
		body: IDL.Opt(IDL.Vec(IDL.Nat8)),
		transform: IDL.Opt(
			IDL.Record({
				function: IDL.Func(
					[
						IDL.Record({
							context: IDL.Vec(IDL.Nat8),
							response: http_request_result
						})
					],
					[http_request_result],
					['query']
				),
				context: IDL.Vec(IDL.Nat8)
			})
		),
		headers: IDL.Vec(http_header)
	});
	const chunk_hash = IDL.Vec(IDL.Nat8);
	const install_chunked_code_args = IDL.Record({
		arg: IDL.Vec(IDL.Nat8),
		wasm_module_hash: IDL.Vec(IDL.Nat8),
		mode: IDL.Variant({
			reinstall: IDL.Null,
			upgrade: IDL.Opt(IDL.Record({ skip_pre_upgrade: IDL.Opt(IDL.Bool) })),
			install: IDL.Null
		}),
		chunk_hashes_list: IDL.Vec(chunk_hash),
		target_canister: canister_id,
		sender_canister_version: IDL.Opt(IDL.Nat64),
		storage_canister: IDL.Opt(canister_id)
	});
	const wasm_module = IDL.Vec(IDL.Nat8);
	const install_code_args = IDL.Record({
		arg: IDL.Vec(IDL.Nat8),
		wasm_module: wasm_module,
		mode: IDL.Variant({
			reinstall: IDL.Null,
			upgrade: IDL.Opt(IDL.Record({ skip_pre_upgrade: IDL.Opt(IDL.Bool) })),
			install: IDL.Null
		}),
		canister_id: canister_id,
		sender_canister_version: IDL.Opt(IDL.Nat64)
	});
	const node_metrics_history_args = IDL.Record({
		start_at_timestamp_nanos: IDL.Nat64,
		subnet_id: IDL.Principal
	});
	const node_metrics = IDL.Record({
		num_block_failures_total: IDL.Nat64,
		node_id: IDL.Principal,
		num_blocks_total: IDL.Nat64
	});
	const node_metrics_history_result = IDL.Vec(
		IDL.Record({
			timestamp_nanos: IDL.Nat64,
			node_metrics: IDL.Vec(node_metrics)
		})
	);
	const provisional_create_canister_with_cycles_args = IDL.Record({
		settings: IDL.Opt(canister_settings),
		specified_id: IDL.Opt(canister_id),
		amount: IDL.Opt(IDL.Nat),
		sender_canister_version: IDL.Opt(IDL.Nat64)
	});
	const provisional_create_canister_with_cycles_result = IDL.Record({
		canister_id: canister_id
	});
	const provisional_top_up_canister_args = IDL.Record({
		canister_id: canister_id,
		amount: IDL.Nat
	});
	const raw_rand_result = IDL.Vec(IDL.Nat8);
	const sign_with_ecdsa_args = IDL.Record({
		key_id: IDL.Record({ name: IDL.Text, curve: ecdsa_curve }),
		derivation_path: IDL.Vec(IDL.Vec(IDL.Nat8)),
		message_hash: IDL.Vec(IDL.Nat8)
	});
	const sign_with_ecdsa_result = IDL.Record({
		signature: IDL.Vec(IDL.Nat8)
	});
	const start_canister_args = IDL.Record({ canister_id: canister_id });
	const stop_canister_args = IDL.Record({ canister_id: canister_id });
	const stored_chunks_args = IDL.Record({ canister_id: canister_id });
	const stored_chunks_result = IDL.Vec(chunk_hash);
	const uninstall_code_args = IDL.Record({
		canister_id: canister_id,
		sender_canister_version: IDL.Opt(IDL.Nat64)
	});
	const update_settings_args = IDL.Record({
		canister_id: IDL.Principal,
		settings: canister_settings,
		sender_canister_version: IDL.Opt(IDL.Nat64)
	});
	const upload_chunk_args = IDL.Record({
		chunk: IDL.Vec(IDL.Nat8),
		canister_id: IDL.Principal
	});
	const upload_chunk_result = chunk_hash;
	return IDL.Service({
		bitcoin_get_balance: IDL.Func([bitcoin_get_balance_args], [bitcoin_get_balance_result], []),
		bitcoin_get_balance_query: IDL.Func(
			[bitcoin_get_balance_query_args],
			[bitcoin_get_balance_query_result],
			['query']
		),
		bitcoin_get_current_fee_percentiles: IDL.Func(
			[bitcoin_get_current_fee_percentiles_args],
			[bitcoin_get_current_fee_percentiles_result],
			[]
		),
		bitcoin_get_utxos: IDL.Func([bitcoin_get_utxos_args], [bitcoin_get_utxos_result], []),
		bitcoin_get_utxos_query: IDL.Func(
			[bitcoin_get_utxos_query_args],
			[bitcoin_get_utxos_query_result],
			['query']
		),
		bitcoin_send_transaction: IDL.Func([bitcoin_send_transaction_args], [], []),
		canister_info: IDL.Func([canister_info_args], [canister_info_result], []),
		canister_status: IDL.Func([canister_status_args], [canister_status_result], []),
		clear_chunk_store: IDL.Func([clear_chunk_store_args], [], []),
		create_canister: IDL.Func([create_canister_args], [create_canister_result], []),
		delete_canister: IDL.Func([delete_canister_args], [], []),
		deposit_cycles: IDL.Func([deposit_cycles_args], [], []),
		ecdsa_public_key: IDL.Func([ecdsa_public_key_args], [ecdsa_public_key_result], []),
		fetch_canister_logs: IDL.Func(
			[fetch_canister_logs_args],
			[fetch_canister_logs_result],
			['query']
		),
		http_request: IDL.Func([http_request_args], [http_request_result], []),
		install_chunked_code: IDL.Func([install_chunked_code_args], [], []),
		install_code: IDL.Func([install_code_args], [], []),
		node_metrics_history: IDL.Func([node_metrics_history_args], [node_metrics_history_result], []),
		provisional_create_canister_with_cycles: IDL.Func(
			[provisional_create_canister_with_cycles_args],
			[provisional_create_canister_with_cycles_result],
			[]
		),
		provisional_top_up_canister: IDL.Func([provisional_top_up_canister_args], [], []),
		raw_rand: IDL.Func([], [raw_rand_result], []),
		sign_with_ecdsa: IDL.Func([sign_with_ecdsa_args], [sign_with_ecdsa_result], []),
		start_canister: IDL.Func([start_canister_args], [], []),
		stop_canister: IDL.Func([stop_canister_args], [], []),
		stored_chunks: IDL.Func([stored_chunks_args], [stored_chunks_result], []),
		uninstall_code: IDL.Func([uninstall_code_args], [], []),
		update_settings: IDL.Func([update_settings_args], [], []),
		upload_chunk: IDL.Func([upload_chunk_args], [upload_chunk_result], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

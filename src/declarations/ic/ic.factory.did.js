// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const bitcoin_network = IDL.Variant({
		mainnet: IDL.Null,
		testnet: IDL.Null
	});
	const bitcoin_address = IDL.Text;
	const get_balance_request = IDL.Record({
		network: bitcoin_network,
		address: bitcoin_address,
		min_confirmations: IDL.Opt(IDL.Nat32)
	});
	const satoshi = IDL.Nat64;
	const get_current_fee_percentiles_request = IDL.Record({
		network: bitcoin_network
	});
	const millisatoshi_per_byte = IDL.Nat64;
	const get_utxos_request = IDL.Record({
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
	const get_utxos_response = IDL.Record({
		next_page: IDL.Opt(IDL.Vec(IDL.Nat8)),
		tip_height: IDL.Nat32,
		tip_block_hash: block_hash,
		utxos: IDL.Vec(utxo)
	});
	const send_transaction_request = IDL.Record({
		transaction: IDL.Vec(IDL.Nat8),
		network: bitcoin_network
	});
	const canister_id = IDL.Principal;
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
	const definite_canister_settings = IDL.Record({
		freezing_threshold: IDL.Nat,
		controllers: IDL.Vec(IDL.Principal),
		memory_allocation: IDL.Nat,
		compute_allocation: IDL.Nat
	});
	const canister_settings = IDL.Record({
		freezing_threshold: IDL.Opt(IDL.Nat),
		controllers: IDL.Opt(IDL.Vec(IDL.Principal)),
		memory_allocation: IDL.Opt(IDL.Nat),
		compute_allocation: IDL.Opt(IDL.Nat)
	});
	const ecdsa_curve = IDL.Variant({ secp256k1: IDL.Null });
	const http_header = IDL.Record({ value: IDL.Text, name: IDL.Text });
	const http_response = IDL.Record({
		status: IDL.Nat,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(http_header)
	});
	const wasm_module = IDL.Vec(IDL.Nat8);
	return IDL.Service({
		bitcoin_get_balance: IDL.Func([get_balance_request], [satoshi], []),
		bitcoin_get_current_fee_percentiles: IDL.Func(
			[get_current_fee_percentiles_request],
			[IDL.Vec(millisatoshi_per_byte)],
			[]
		),
		bitcoin_get_utxos: IDL.Func([get_utxos_request], [get_utxos_response], []),
		bitcoin_send_transaction: IDL.Func([send_transaction_request], [], []),
		canister_info: IDL.Func(
			[
				IDL.Record({
					canister_id: canister_id,
					num_requested_changes: IDL.Opt(IDL.Nat64)
				})
			],
			[
				IDL.Record({
					controllers: IDL.Vec(IDL.Principal),
					module_hash: IDL.Opt(IDL.Vec(IDL.Nat8)),
					recent_changes: IDL.Vec(change),
					total_num_changes: IDL.Nat64
				})
			],
			[]
		),
		canister_status: IDL.Func(
			[IDL.Record({ canister_id: canister_id })],
			[
				IDL.Record({
					status: IDL.Variant({
						stopped: IDL.Null,
						stopping: IDL.Null,
						running: IDL.Null
					}),
					memory_size: IDL.Nat,
					cycles: IDL.Nat,
					settings: definite_canister_settings,
					idle_cycles_burned_per_day: IDL.Nat,
					module_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
				})
			],
			[]
		),
		create_canister: IDL.Func(
			[
				IDL.Record({
					settings: IDL.Opt(canister_settings),
					sender_canister_version: IDL.Opt(IDL.Nat64)
				})
			],
			[IDL.Record({ canister_id: canister_id })],
			[]
		),
		delete_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
		deposit_cycles: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
		ecdsa_public_key: IDL.Func(
			[
				IDL.Record({
					key_id: IDL.Record({ name: IDL.Text, curve: ecdsa_curve }),
					canister_id: IDL.Opt(canister_id),
					derivation_path: IDL.Vec(IDL.Vec(IDL.Nat8))
				})
			],
			[
				IDL.Record({
					public_key: IDL.Vec(IDL.Nat8),
					chain_code: IDL.Vec(IDL.Nat8)
				})
			],
			[]
		),
		http_request: IDL.Func(
			[
				IDL.Record({
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
										response: http_response
									})
								],
								[http_response],
								['query']
							),
							context: IDL.Vec(IDL.Nat8)
						})
					),
					headers: IDL.Vec(http_header)
				})
			],
			[http_response],
			[]
		),
		install_code: IDL.Func(
			[
				IDL.Record({
					arg: IDL.Vec(IDL.Nat8),
					wasm_module: wasm_module,
					mode: IDL.Variant({
						reinstall: IDL.Null,
						upgrade: IDL.Null,
						install: IDL.Null
					}),
					canister_id: canister_id,
					sender_canister_version: IDL.Opt(IDL.Nat64)
				})
			],
			[],
			[]
		),
		provisional_create_canister_with_cycles: IDL.Func(
			[
				IDL.Record({
					settings: IDL.Opt(canister_settings),
					specified_id: IDL.Opt(canister_id),
					amount: IDL.Opt(IDL.Nat)
				})
			],
			[IDL.Record({ canister_id: canister_id })],
			[]
		),
		provisional_top_up_canister: IDL.Func(
			[IDL.Record({ canister_id: canister_id, amount: IDL.Nat })],
			[],
			[]
		),
		raw_rand: IDL.Func([], [IDL.Vec(IDL.Nat8)], []),
		sign_with_ecdsa: IDL.Func(
			[
				IDL.Record({
					key_id: IDL.Record({ name: IDL.Text, curve: ecdsa_curve }),
					derivation_path: IDL.Vec(IDL.Vec(IDL.Nat8)),
					message_hash: IDL.Vec(IDL.Nat8)
				})
			],
			[IDL.Record({ signature: IDL.Vec(IDL.Nat8) })],
			[]
		),
		start_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
		stop_canister: IDL.Func([IDL.Record({ canister_id: canister_id })], [], []),
		uninstall_code: IDL.Func(
			[
				IDL.Record({
					canister_id: canister_id,
					sender_canister_version: IDL.Opt(IDL.Nat64)
				})
			],
			[],
			[]
		),
		update_settings: IDL.Func(
			[
				IDL.Record({
					canister_id: IDL.Principal,
					settings: canister_settings,
					sender_canister_version: IDL.Opt(IDL.Nat64)
				})
			],
			[],
			[]
		)
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

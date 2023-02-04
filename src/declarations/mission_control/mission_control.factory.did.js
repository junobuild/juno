export const idlFactory = ({ IDL }) => {
	const Satellite = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal
	});
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const Operation = IDL.Variant({
		Burn: IDL.Record({ from: IDL.Vec(IDL.Nat8), amount: Tokens }),
		Mint: IDL.Record({ to: IDL.Vec(IDL.Nat8), amount: Tokens }),
		Transfer: IDL.Record({
			to: IDL.Vec(IDL.Nat8),
			fee: Tokens,
			from: IDL.Vec(IDL.Nat8),
			amount: Tokens
		})
	});
	const Timestamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
	const Transaction = IDL.Record({
		block_index: IDL.Nat64,
		memo: IDL.Nat64,
		operation: IDL.Opt(Operation),
		timestamp: Timestamp
	});
	return IDL.Service({
		add_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		add_satellites_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		create_satellite: IDL.Func([IDL.Text], [Satellite], []),
		get_user: IDL.Func([], [IDL.Principal], ['query']),
		list_mission_control_controllers: IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
		list_satellites: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Satellite))], ['query']),
		list_transactions: IDL.Func([], [IDL.Vec(Transaction)], ['query']),
		remove_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		remove_satellites_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)],
			[],
			[]
		),
		top_up: IDL.Func([IDL.Principal, Tokens], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
export const init = ({ IDL }) => {
	return [];
};

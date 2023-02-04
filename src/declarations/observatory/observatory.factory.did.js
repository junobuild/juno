export const idlFactory = ({ IDL }) => {
	const ObservatoryAddMissionControlArgs = IDL.Record({
		mission_control_id: IDL.Principal,
		owner: IDL.Principal
	});
	const ListTransactionsArgs = IDL.Record({
		account_identifier: IDL.Vec(IDL.Nat8)
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
		add_mission_control: IDL.Func([ObservatoryAddMissionControlArgs], [], []),
		list_transactions: IDL.Func([ListTransactionsArgs], [IDL.Vec(Transaction)], ['query']),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
export const init = ({ IDL }) => {
	return [];
};

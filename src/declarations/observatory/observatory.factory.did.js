// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const CyclesBalance = IDL.Record({
		timestamp: IDL.Nat64,
		amount: IDL.Nat
	});
	const SendDepositedCyclesEmailNotification = IDL.Record({
		to: IDL.Text,
		deposited_cycles: CyclesBalance,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)))
	});
	const SendNotification = IDL.Variant({
		DepositedCyclesEmail: SendDepositedCyclesEmailNotification
	});
	const NotifyArgs = IDL.Record({
		user: IDL.Principal,
		segment_id: IDL.Principal,
		notification: SendNotification
	});
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null
	});
	const SetController = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const SetControllersArgs = IDL.Record({
		controller: SetController,
		controllers: IDL.Vec(IDL.Principal)
	});
	const Env = IDL.Record({ email_api_key: IDL.Opt(IDL.Text) });
	const HttpHeader = IDL.Record({ value: IDL.Text, name: IDL.Text });
	const HttpResponse = IDL.Record({
		status: IDL.Nat,
		body: IDL.Vec(IDL.Nat8),
		headers: IDL.Vec(HttpHeader)
	});
	const TransformArgs = IDL.Record({
		context: IDL.Vec(IDL.Nat8),
		response: HttpResponse
	});
	return IDL.Service({
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		notify: IDL.Func([NotifyArgs], [], []),
		ping: IDL.Func([NotifyArgs], [], []),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_env: IDL.Func([Env], [], []),
		transform: IDL.Func([TransformArgs], [HttpResponse], ['query']),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

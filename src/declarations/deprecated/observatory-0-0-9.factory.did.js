// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const GetNotifications = IDL.Record({
		to: IDL.Opt(IDL.Nat64),
		from: IDL.Opt(IDL.Nat64),
		segment_id: IDL.Opt(IDL.Principal)
	});
	const NotifyStatus = IDL.Record({
		pending: IDL.Nat64,
		sent: IDL.Nat64,
		failed: IDL.Nat64
	});
	const ControllerScope = IDL.Variant({
		Write: IDL.Null,
		Admin: IDL.Null
	});
	const Controller = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const CyclesBalance = IDL.Record({
		timestamp: IDL.Nat64,
		amount: IDL.Nat
	});
	const DepositedCyclesEmailNotification = IDL.Record({
		to: IDL.Text,
		deposited_cycles: CyclesBalance
	});
	const NotificationKind = IDL.Variant({
		DepositedCyclesEmail: DepositedCyclesEmailNotification
	});
	const SegmentKind = IDL.Variant({
		Orbiter: IDL.Null,
		MissionControl: IDL.Null,
		Satellite: IDL.Null
	});
	const Segment = IDL.Record({
		id: IDL.Principal,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		kind: SegmentKind
	});
	const NotifyArgs = IDL.Record({
		kind: NotificationKind,
		user: IDL.Principal,
		segment: Segment
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
	return IDL.Service({
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		get_notify_status: IDL.Func([GetNotifications], [NotifyStatus], ['query']),
		list_controllers: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Controller))], ['query']),
		notify: IDL.Func([NotifyArgs], [], []),
		ping: IDL.Func([NotifyArgs], [], []),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_env: IDL.Func([Env], [], [])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

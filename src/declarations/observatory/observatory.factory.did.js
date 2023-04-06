export const idlFactory = ({ IDL }) => {
	const DeleteControllersArgs = IDL.Record({
		controllers: IDL.Vec(IDL.Principal)
	});
	const CanisterStatusType = IDL.Variant({
		stopped: IDL.Null,
		stopping: IDL.Null,
		running: IDL.Null
	});
	const DefiniteCanisterSettings = IDL.Record({
		freezing_threshold: IDL.Nat,
		controllers: IDL.Vec(IDL.Principal),
		memory_allocation: IDL.Nat,
		compute_allocation: IDL.Nat
	});
	const CanisterStatusResponse = IDL.Record({
		status: CanisterStatusType,
		memory_size: IDL.Nat,
		cycles: IDL.Nat,
		settings: DefiniteCanisterSettings,
		idle_cycles_burned_per_day: IDL.Nat,
		module_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const SegmentStatus = IDL.Record({
		id: IDL.Principal,
		status: CanisterStatusResponse,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		status_at: IDL.Nat64
	});
	const Result = IDL.Variant({ Ok: SegmentStatus, Err: IDL.Text });
	const SegmentsStatuses = IDL.Record({
		satellites: IDL.Opt(IDL.Vec(Result)),
		mission_control: Result
	});
	const Result_1 = IDL.Variant({ Ok: SegmentsStatuses, Err: IDL.Text });
	const ListStatuses = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		statuses: Result_1,
		timestamp: IDL.Nat64
	});
	const SetController = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const SetControllersArgs = IDL.Record({
		controller: SetController,
		controllers: IDL.Vec(IDL.Principal)
	});
	const StatusesCronJob = IDL.Record({
		enabled: IDL.Bool,
		cycles_threshold: IDL.Nat64
	});
	const CronJobs = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		statuses: StatusesCronJob
	});
	const SetCronJobsArgs = IDL.Record({
		cron_jobs: CronJobs,
		mission_control_id: IDL.Principal
	});
	return IDL.Service({
		del_controllers: IDL.Func([DeleteControllersArgs], [], []),
		del_cron_controllers: IDL.Func([DeleteControllersArgs], [], []),
		list_last_statuses: IDL.Func([], [IDL.Vec(ListStatuses)], ['query']),
		set_controllers: IDL.Func([SetControllersArgs], [], []),
		set_cron_controllers: IDL.Func([SetControllersArgs], [], []),
		set_cron_jobs: IDL.Func([SetCronJobsArgs], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
export const init = ({ IDL }) => {
	return [];
};

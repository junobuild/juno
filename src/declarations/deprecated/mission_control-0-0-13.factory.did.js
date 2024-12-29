// @ts-ignore
export const idlFactory = ({ IDL }) => {
	const CyclesThreshold = IDL.Record({
		fund_cycles: IDL.Nat,
		min_cycles: IDL.Nat
	});
	const CyclesMonitoringStrategy = IDL.Variant({
		BelowThreshold: CyclesThreshold
	});
	const CyclesMonitoring = IDL.Record({
		strategy: IDL.Opt(CyclesMonitoringStrategy),
		enabled: IDL.Bool
	});
	const Monitoring = IDL.Record({ cycles: IDL.Opt(CyclesMonitoring) });
	const Settings = IDL.Record({ monitoring: IDL.Opt(Monitoring) });
	const Orbiter = IDL.Record({
		updated_at: IDL.Nat64,
		orbiter_id: IDL.Principal,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		settings: IDL.Opt(Settings)
	});
	const CreateCanisterConfig = IDL.Record({
		subnet_id: IDL.Opt(IDL.Principal),
		name: IDL.Opt(IDL.Text)
	});
	const Satellite = IDL.Record({
		updated_at: IDL.Nat64,
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		created_at: IDL.Nat64,
		satellite_id: IDL.Principal,
		settings: IDL.Opt(Settings)
	});
	const DepositCyclesArgs = IDL.Record({
		cycles: IDL.Nat,
		destination_id: IDL.Principal
	});
	const GetMonitoringHistory = IDL.Record({
		to: IDL.Opt(IDL.Nat64),
		from: IDL.Opt(IDL.Nat64),
		segment_id: IDL.Principal
	});
	const MonitoringHistoryKey = IDL.Record({
		segment_id: IDL.Principal,
		created_at: IDL.Nat64
	});
	const CyclesBalance = IDL.Record({
		timestamp: IDL.Nat64,
		amount: IDL.Nat
	});
	const MonitoringHistoryCycles = IDL.Record({
		deposited_cycles: IDL.Opt(CyclesBalance),
		cycles: CyclesBalance
	});
	const MonitoringHistory = IDL.Record({
		cycles: IDL.Opt(MonitoringHistoryCycles)
	});
	const CyclesMonitoringStatus = IDL.Record({
		monitored_ids: IDL.Vec(IDL.Principal),
		running: IDL.Bool
	});
	const MonitoringStatus = IDL.Record({
		cycles: IDL.Opt(CyclesMonitoringStatus)
	});
	const MissionControlSettings = IDL.Record({
		updated_at: IDL.Nat64,
		created_at: IDL.Nat64,
		monitoring: IDL.Opt(Monitoring)
	});
	const Tokens = IDL.Record({ e8s: IDL.Nat64 });
	const Timestamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
	const TransferArgs = IDL.Record({
		to: IDL.Vec(IDL.Nat8),
		fee: Tokens,
		memo: IDL.Nat64,
		from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
		created_at_time: IDL.Opt(Timestamp),
		amount: Tokens
	});
	const TransferError = IDL.Variant({
		TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
		BadFee: IDL.Record({ expected_fee: Tokens }),
		TxDuplicate: IDL.Record({ duplicate_of: IDL.Nat64 }),
		TxCreatedInFuture: IDL.Null,
		InsufficientFunds: IDL.Record({ balance: Tokens })
	});
	const Result = IDL.Variant({ Ok: IDL.Nat64, Err: TransferError });
	const Account = IDL.Record({
		owner: IDL.Principal,
		subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const TransferArg = IDL.Record({
		to: Account,
		fee: IDL.Opt(IDL.Nat),
		memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
		from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
		created_at_time: IDL.Opt(IDL.Nat64),
		amount: IDL.Nat
	});
	const TransferError_1 = IDL.Variant({
		GenericError: IDL.Record({
			message: IDL.Text,
			error_code: IDL.Nat
		}),
		TemporarilyUnavailable: IDL.Null,
		BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
		Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
		BadFee: IDL.Record({ expected_fee: IDL.Nat }),
		CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
		TooOld: IDL.Null,
		InsufficientFunds: IDL.Record({ balance: IDL.Nat })
	});
	const Result_1 = IDL.Variant({ Ok: IDL.Nat, Err: TransferError_1 });
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
	const CanisterStatusType = IDL.Variant({
		stopped: IDL.Null,
		stopping: IDL.Null,
		running: IDL.Null
	});
	const SegmentCanisterSettings = IDL.Record({
		freezing_threshold: IDL.Nat,
		controllers: IDL.Vec(IDL.Principal),
		memory_allocation: IDL.Nat,
		compute_allocation: IDL.Nat
	});
	const SegmentCanisterStatus = IDL.Record({
		status: CanisterStatusType,
		memory_size: IDL.Nat,
		cycles: IDL.Nat,
		settings: SegmentCanisterSettings,
		idle_cycles_burned_per_day: IDL.Nat,
		module_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
	});
	const SegmentStatus = IDL.Record({
		id: IDL.Principal,
		status: SegmentCanisterStatus,
		metadata: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
		status_at: IDL.Nat64
	});
	const Result_2 = IDL.Variant({ Ok: SegmentStatus, Err: IDL.Text });
	const SetController = IDL.Record({
		metadata: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
		scope: ControllerScope,
		expires_at: IDL.Opt(IDL.Nat64)
	});
	const CronJobStatusesConfig = IDL.Record({
		enabled: IDL.Bool,
		cycles_threshold: IDL.Opt(IDL.Nat64)
	});
	const StatusesArgs = IDL.Record({
		mission_control_cycles_threshold: IDL.Opt(IDL.Nat64),
		orbiters: IDL.Vec(IDL.Tuple(IDL.Principal, CronJobStatusesConfig)),
		satellites: IDL.Vec(IDL.Tuple(IDL.Principal, CronJobStatusesConfig)),
		cycles_threshold: IDL.Opt(IDL.Nat64)
	});
	const SegmentsStatuses = IDL.Record({
		orbiters: IDL.Opt(IDL.Vec(Result_2)),
		satellites: IDL.Opt(IDL.Vec(Result_2)),
		mission_control: Result_2
	});
	const SegmentsMonitoringStrategy = IDL.Record({
		ids: IDL.Vec(IDL.Principal),
		strategy: CyclesMonitoringStrategy
	});
	const CyclesMonitoringStartConfig = IDL.Record({
		orbiters_strategy: IDL.Opt(SegmentsMonitoringStrategy),
		mission_control_strategy: IDL.Opt(CyclesMonitoringStrategy),
		satellites_strategy: IDL.Opt(SegmentsMonitoringStrategy)
	});
	const MonitoringStartConfig = IDL.Record({
		cycles_config: IDL.Opt(CyclesMonitoringStartConfig)
	});
	const CyclesMonitoringStopConfig = IDL.Record({
		satellite_ids: IDL.Opt(IDL.Vec(IDL.Principal)),
		try_mission_control: IDL.Opt(IDL.Bool),
		orbiter_ids: IDL.Opt(IDL.Vec(IDL.Principal))
	});
	const MonitoringStopConfig = IDL.Record({
		cycles_config: IDL.Opt(CyclesMonitoringStopConfig)
	});
	return IDL.Service({
		add_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		add_satellites_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		create_orbiter: IDL.Func([IDL.Opt(IDL.Text)], [Orbiter], []),
		create_orbiter_with_config: IDL.Func([CreateCanisterConfig], [Orbiter], []),
		create_satellite: IDL.Func([IDL.Text], [Satellite], []),
		create_satellite_with_config: IDL.Func([CreateCanisterConfig], [Satellite], []),
		del_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		del_orbiter: IDL.Func([IDL.Principal, IDL.Nat], [], []),
		del_orbiters_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		del_satellite: IDL.Func([IDL.Principal, IDL.Nat], [], []),
		del_satellites_controllers: IDL.Func([IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)], [], []),
		deposit_cycles: IDL.Func([DepositCyclesArgs], [], []),
		get_monitoring_history: IDL.Func(
			[GetMonitoringHistory],
			[IDL.Vec(IDL.Tuple(MonitoringHistoryKey, MonitoringHistory))],
			['query']
		),
		get_monitoring_status: IDL.Func([], [MonitoringStatus], ['query']),
		get_settings: IDL.Func([], [IDL.Opt(MissionControlSettings)], ['query']),
		get_user: IDL.Func([], [IDL.Principal], ['query']),
		icp_transfer: IDL.Func([TransferArgs], [Result], []),
		icrc_transfer: IDL.Func([IDL.Principal, TransferArg], [Result_1], []),
		list_mission_control_controllers: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Principal, Controller))],
			['query']
		),
		list_mission_control_statuses: IDL.Func(
			[],
			[IDL.Vec(IDL.Tuple(IDL.Nat64, Result_2))],
			['query']
		),
		list_orbiter_statuses: IDL.Func(
			[IDL.Principal],
			[IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat64, Result_2)))],
			['query']
		),
		list_orbiters: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Orbiter))], ['query']),
		list_satellite_statuses: IDL.Func(
			[IDL.Principal],
			[IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Nat64, Result_2)))],
			['query']
		),
		list_satellites: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, Satellite))], ['query']),
		remove_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal)], [], []),
		remove_satellites_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal)],
			[],
			[]
		),
		set_metadata: IDL.Func([IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], [], []),
		set_mission_control_controllers: IDL.Func([IDL.Vec(IDL.Principal), SetController], [], []),
		set_orbiter: IDL.Func([IDL.Principal, IDL.Opt(IDL.Text)], [Orbiter], []),
		set_orbiter_metadata: IDL.Func(
			[IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[Orbiter],
			[]
		),
		set_orbiters_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal), SetController],
			[],
			[]
		),
		set_satellite: IDL.Func([IDL.Principal, IDL.Opt(IDL.Text)], [Satellite], []),
		set_satellite_metadata: IDL.Func(
			[IDL.Principal, IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
			[Satellite],
			[]
		),
		set_satellites_controllers: IDL.Func(
			[IDL.Vec(IDL.Principal), IDL.Vec(IDL.Principal), SetController],
			[],
			[]
		),
		start_monitoring: IDL.Func([], [], []),
		status: IDL.Func([StatusesArgs], [SegmentsStatuses], []),
		stop_monitoring: IDL.Func([], [], []),
		top_up: IDL.Func([IDL.Principal, Tokens], [], []),
		unset_orbiter: IDL.Func([IDL.Principal], [], []),
		unset_satellite: IDL.Func([IDL.Principal], [], []),
		update_and_start_monitoring: IDL.Func([MonitoringStartConfig], [], []),
		update_and_stop_monitoring: IDL.Func([MonitoringStopConfig], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
// @ts-ignore
export const init = ({ IDL }) => {
	return [];
};

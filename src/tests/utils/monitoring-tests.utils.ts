import type {
	CyclesMonitoringStrategy,
	GetMonitoringHistory,
	_SERVICE as MissionControlActor,
	Monitoring,
	MonitoringHistory,
	MonitoringHistoryKey
} from '$declarations/mission_control/mission_control.did';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Actor } from '@hadronous/pic';

const testMonitoring = ({
	monitoring,
	expectedEnabled,
	expectedStrategy
}: {
	monitoring: Monitoring | undefined;
	expectedEnabled: boolean;
	expectedStrategy: CyclesMonitoringStrategy;
}) => {
	const cycles = fromNullable(monitoring?.cycles ?? []);
	const cyclesStrategy = fromNullable(cycles?.strategy ?? []);

	expect(cycles?.enabled).toBe(expectedEnabled);
	expect(cyclesStrategy?.BelowThreshold.fund_cycles).toEqual(
		expectedStrategy.BelowThreshold.fund_cycles
	);
	expect(cyclesStrategy?.BelowThreshold.min_cycles).toEqual(
		expectedStrategy.BelowThreshold.min_cycles
	);
};

export const testMissionControlMonitoring = async ({
	expectedEnabled,
	expectedStrategy,
	actor
}: {
	expectedEnabled: boolean;
	expectedStrategy: CyclesMonitoringStrategy;
	actor: Actor<MissionControlActor>;
}) => {
	const { get_settings } = actor;

	const settings = fromNullable(await get_settings());
	const monitoring = fromNullable(settings?.monitoring ?? []);

	testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
};

export const testSatellitesMonitoring = async ({
	expectedEnabled,
	expectedStrategy,
	actor
}: {
	expectedEnabled: boolean;
	expectedStrategy: CyclesMonitoringStrategy;
	actor: Actor<MissionControlActor>;
}) => {
	const { list_satellites } = actor;

	const [[_, satellite]] = await list_satellites();

	const settings = fromNullable(satellite.settings);
	const monitoring = fromNullable(settings?.monitoring ?? []);

	testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
};

export const testOrbiterMonitoring = async ({
	expectedEnabled,
	expectedStrategy,
	actor
}: {
	expectedEnabled: boolean;
	expectedStrategy: CyclesMonitoringStrategy;
	actor: Actor<MissionControlActor>;
}) => {
	const { list_orbiters } = actor;

	const [[_, orbiter]] = await list_orbiters();

	const settings = fromNullable(orbiter.settings);
	const monitoring = fromNullable(settings?.monitoring ?? []);

	testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
};

export const testMonitoringHistory = async ({
	segmentId,
	expectedLength,
	actor
}: {
	segmentId: Principal;
	expectedLength: number;
	actor: Actor<MissionControlActor>;
}): Promise<[MonitoringHistoryKey, MonitoringHistory][]> => {
	const { get_monitoring_history } = actor;

	const filter: GetMonitoringHistory = {
		segment_id: segmentId,
		from: toNullable(),
		to: toNullable()
	};

	const results = await get_monitoring_history(filter);

	expect(results).toHaveLength(expectedLength);

	results.forEach((result) => {
		const [key, history] = result;

		expect(key.segment_id.toText()).toEqual(segmentId.toText());
		expect(key.created_at).toBeGreaterThan(0n);

		const cycles = fromNullable(history.cycles);

		assertNonNullish(cycles);

		expect(cycles.cycles.amount).toBeGreaterThan(0n);
		expect(cycles.cycles.timestamp).toBeGreaterThan(0n);

		expect(fromNullable(cycles.deposited_cycles)).toBeUndefined();
	});

	return results.sort(
		([{ created_at: aCreatedAt }, _], [{ created_at: bCreateAt }, __]) =>
			Number(aCreatedAt) - Number(bCreateAt)
	);
};

import type { _SERVICE as IcActor, canister_log_record } from '$declarations/ic/ic.did';
import { idlFactory as idlFactorIc } from '$declarations/ic/ic.factory.did';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe } from 'vitest';
import { mockSetRule } from './mocks/collection.mocks';
import { setupTestSatellite } from './utils/satellite-fixtures-tests.utils';

describe('Satellite > Hooks', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSatellite();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	interface Log {
		message: string;
		timestamp: bigint;
	}

	const getLogs = async () => {
		const mgmtActor = pic.createActor<IcActor>(idlFactorIc, Principal.fromText('aaaaa-aa'));
		mgmtActor.setIdentity(controller);

		const { fetch_canister_logs } = mgmtActor;

		const { canister_log_records: logs } = await fetch_canister_logs({ canister_id: canisterId });

		const mapLog = async ({
			idx,
			timestamp_nanos: timestamp,
			content
		}: canister_log_record): Promise<[string, Log]> => {
			const blob: Blob = new Blob([
				content instanceof Uint8Array ? content : new Uint8Array(content)
			]);

			return [
				`[ic]-${idx}`,
				{
					message: await blob.text(),
					timestamp
				}
			];
		};

		return await Promise.all(logs.map(mapLog));
	};

	const assertLog = async (logMessage: string) => {
		const logs = await getLogs();

		const log = logs.find(([_, { message }]) => message === logMessage);

		expect(log).not.toBeUndefined();
	};

	it('should call on init sync', async () => {
		await assertLog('On init sync was executed');
	});

	it('should call on post_upgrade sync', async () => {
		await assertLog('On post upgrade sync was executed');
	});
});

import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { setupTestSatellite } from '../../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../../utils/mgmt-test.utils';

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

	const assertLog = async (logMessage: string) => {
		const logs = await fetchLogs({
			pic,
			controller,
			canisterId
		});

		const log = logs.find(([_, { message }]) => message === logMessage);

		expect(log).not.toBeUndefined();
	};

	describe('controller', () => {
		it('should call on init sync', async () => {
			await assertLog('On init sync was executed');
		});

		it('should call on post_upgrade sync', async () => {
			await assertLog('On post upgrade sync was executed');
		});
	});
});

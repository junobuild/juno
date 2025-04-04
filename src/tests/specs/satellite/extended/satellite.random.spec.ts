import type {
	Result,
	_SERVICE as TestSatelliteActor
} from '$test-declarations/test_satellite/test_satellite.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { type PocketIc , type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe } from 'vitest';
import { mockSetRule } from '../../../mocks/collection.mocks';
import { setupTestSatellite, upgradeTestSatellite } from '../../../utils/fixtures-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Satellite > Random', () => {
	let pic: PocketIc;
	let actor: Actor<TestSatelliteActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test_logging';

	beforeAll(async () => {
		const {
			pic: p,
			actor: a,
			canisterId: cId,
			controller: c
		} = await setupTestSatellite({ withUpgrade: false });

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

	it('should not be initialized by default', async () => {
		const { get_random } = actor;

		const result = await get_random();

		expect('Err' in result).toBe(true);

		if ('Ok' in result) {
			expect(true).toBe(false);
			return;
		}

		expect(result.Err).toEqual('The random number generator has not been initialized.');
	});

	it('should be initialized after upgrade', async () => {
		await upgradeTestSatellite({
			pic,
			controller,
			canisterId
		});

		const { get_random } = actor;

		const result = await get_random();

		expect('Ok' in result).toBe(true);

		if ('Err' in result) {
			expect(true).toBe(false);
			return;
		}

		expect(typeof result.Ok).toBe('number');
	});

	it('should generate random numbers', async () => {
		const { get_random } = actor;

		const length = 10;

		const getRandom = async (): Promise<Result> => {
			await tick(pic);
			return await get_random();
		};

		const results = await Promise.all(Array.from({ length }).map(() => getRandom()));

		const oks = results.filter((result) => 'Ok' in result);
		expect(oks.length).toEqual(length);

		const numbers = oks.map((result) => (result as unknown as { Ok: number }).Ok);

		const uniqueNumbers = new Set(numbers);
		expect(uniqueNumbers.size).toEqual(length);
	});
});

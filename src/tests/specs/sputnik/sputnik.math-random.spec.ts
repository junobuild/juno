import type { SputnikActor } from '$declarations';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > math', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-mathrandom';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

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

	it('should generate random numbers', async () => {
		await tick(pic);

		const { logs } = await setDocAndFetchLogs({
			collection: TEST_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const values = logs
			.filter(([_, { message }]) => message.includes('Random:'))
			.map(([_, { message }]) => message.replace('Random:', '').trim());

		expect(new Set(values).size).toEqual(logs.length);
	});
});

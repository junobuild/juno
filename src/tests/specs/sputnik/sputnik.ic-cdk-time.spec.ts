import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > ic-cdk > time', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-ic-cdk-time';

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

	const assertTime = async (): Promise<bigint> => {
		const { logs, docKey } = await setDocAndFetchLogs({
			collection: TEST_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(docKey));

		assertNonNullish(log);

		const [_, { message }] = log;
		return BigInt(message.replace(`${docKey}:`, '').trim());
	};

	it('should use time', async () => {
		const time1 = await assertTime();

		await tick(pic);

		const time2 = await assertTime();

		await tick(pic);

		const time3 = await assertTime();

		expect(time1).toBeTypeOf('bigint');
		expect(time2).toBeTypeOf('bigint');
		expect(time3).toBeTypeOf('bigint');

		expect(time2).toBeGreaterThan(time1);
		expect(time3).toBeGreaterThan(time2);
	});
});

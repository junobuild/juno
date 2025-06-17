import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > ic-cdk > id', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-ic-cdk-id';

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

	const assertId = async (expectedLog: string) => {
		const { logs } = await setDocAndFetchLogs({
			collection: TEST_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(expectedLog));

		expect(log).not.toBeUndefined();
	};

	it('should get and print satellite ID', async () => {
		await assertId(`Satellite ID: ${canisterId.toText()}`);
	});

	it('should get ID as Principal', async () => {
		await assertId(`Satellite ID is principal: true`);
	});

	it('should not get ID as anonymous', async () => {
		await assertId(`Satellite ID is anonymous: false`);
	});
});

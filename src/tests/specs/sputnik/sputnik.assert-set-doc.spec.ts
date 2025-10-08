import { type SputnikActor } from '$lib/api/actors/actor.factory';
import type { Identity } from '@dfinity/agent';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { setDocAndAssertLogsLength } from '../../utils/sputnik-tests.utils';

describe('Sputnik > assert_set_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'test-assert';
	const TEST_NOT_ASSERTED_COLLECTION = 'test';

	beforeAll(async () => {
		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_ASSERTED_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, TEST_NOT_ASSERTED_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setAndAssert = async ({ collection, length }: { collection: string; length: number }) => {
		await setDocAndAssertLogsLength({
			collection,
			length,
			actor,
			controller,
			canisterId,
			pic
		});
	};

	it('should not assert document for unobserved collection', async () => {
		await setAndAssert({
			collection: TEST_NOT_ASSERTED_COLLECTION,
			length: 0
		});
	});

	it('should assert document for observed collection', async () => {
		await setAndAssert({
			collection: TEST_ASSERTED_COLLECTION,
			length: 1
		});
	});
});

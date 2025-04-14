import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { inject } from 'vitest';
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
		pic = await PocketIc.create(inject('PIC_URL'));

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

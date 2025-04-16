import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > assert_set_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-zod';

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

	const setDocAndAssert = async ({ data, success }: { data: Uint8Array; success: boolean }) => {
		const { set_doc } = actor;

		await set_doc(TEST_COLLECTION, nanoid(), {
			data,
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(`Asserting with Zod: ${success}`));

		expect(log).not.toBeUndefined();
	};

	it('should assert success data with zod', async () => {
		await setDocAndAssert({
			data: await toArray(mockSputnikObj),
			success: true
		});
	});

	it('should assert invalid data with zod', async () => {
		await setDocAndAssert({
			data: await toArray({
				...mockSputnikObj,
				not: 'expected'
			}),
			success: false
		});
	});
});

import type { SputnikActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockListParams } from '../../mocks/list.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { addSomeDocsToBeListed } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > deleteFilteredDocsStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-deletefiltereddocs';
	const MOCK_COLLECTION = 'demo-deletefiltereddocs';

	let keys: string[];

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c, canisterId: cId } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;
		canisterId = cId;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, mockSetRule);

		keys = await addSomeDocsToBeListed({
			collection: MOCK_COLLECTION,
			actor,
			controller,
			pic
		});
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setDoc = async (): Promise<void> => {
		const { set_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: Uint8Array.from([]),
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);
	};

	it('should count documents', async () => {
		await setDoc();

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		const countMsg = logs.find(([_, { message }]) => message.includes('Count:'));

		expect(countMsg).not.toBeUndefined();

		const count = BigInt((countMsg?.[1].message ?? '').replace('Count:', '').trim());

		const expectedDeletedCount = 2n;

		expect(count).toEqual(expectedDeletedCount);

		const { list_docs } = actor;

		const docs = await list_docs(MOCK_COLLECTION, mockListParams);

		expect(docs.items_length).toEqual(BigInt(keys.length) - expectedDeletedCount);
	});
});

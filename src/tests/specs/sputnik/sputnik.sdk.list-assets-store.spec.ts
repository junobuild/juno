import type { Doc } from '$declarations/satellite/satellite.did';
import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Actor, PocketIc } from '@hadronous/pic';
import { fromArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import type { SputnikTestListDocs } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { addSomeAssetsToBeListed } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > listAssetsStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-listassets';
	const MOCK_COLLECTION = 'demo-listassets';

	let KEY_1: string;
	let KEY_2: string;
	let KEY_3: string;
	let KEY_4: string;
	let KEY_5: string;

	beforeAll(async () => {
		const { pic: p, actor: a, controller: c, canisterId: cId } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;
		canisterId = cId;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, mockSetRule);
		await set_rule({ Storage: null }, MOCK_COLLECTION, {
			...mockSetRule,
			read: { Public: null },
			write: { Public: null }
		});

		const [key1, key2, key3, key4, key5] = await addSomeAssetsToBeListed({
			collection: MOCK_COLLECTION,
			actor,
			controller,
			pic
		});

		KEY_1 = key1;
		KEY_2 = key2;
		KEY_3 = key3;
		KEY_4 = key4;
		KEY_5 = key5;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setAndGetDoc = async (): Promise<Doc> => {
		const { set_doc, get_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const result = await get_doc(MOCK_COLLECTION, key);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		return doc;
	};

	it('should list documents', async () => {
		const doc = await setAndGetDoc();

		const data: SputnikTestListDocs = await fromArray(doc.data);

		expect(data.items_length).toEqual(2n);
		expect(data.matches_length).toEqual(2n);
		expect(data.items_page).toEqual(0n);
		expect(data.matches_pages).toEqual(0n);

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		// Matcher
		const logKey1 = logs.find(([_, { message }]) => message.includes(KEY_1));

		expect(logKey1).not.toBeUndefined();

		const logKey2 = logs.find(([_, { message }]) => message.includes(KEY_2));

		expect(logKey2).toBeUndefined();

		const logKey3 = logs.find(([_, { message }]) => message.includes(KEY_3));

		expect(logKey3).toBeUndefined();

		const logKey4 = logs.find(([_, { message }]) => message.includes(KEY_4));

		expect(logKey4).not.toBeUndefined();

		// Owner
		const logKey5 = logs.find(([_, { message }]) => message.includes(KEY_5));

		expect(logKey5).toBeUndefined();

		// Sorting
		expect(logs[0][1].message).toContain(KEY_4);
	});
});

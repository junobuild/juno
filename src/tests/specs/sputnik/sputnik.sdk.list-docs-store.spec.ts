import type { Doc } from '$declarations/satellite/satellite.did';
import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj, type SputnikTestListDocs } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
import { tick } from '../../utils/pic-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';
import { initVersionMock } from '../../utils/sputnik-tests.utils';

describe('Sputnik > ic-cdk > call', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-listdocs';
	const MOCK_COLLECTION = 'demo-listdocs';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, controller: c, canisterId: cId } = await setupTestSputnik();

		pic = p;
		actor = a;
		controller = c;
		canisterId = cId;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, {
			...mockSetRule,
			read: { Public: null },
			write: { Public: null }
		});

		await initVersionMock(actor);

		await addSomeDocsToBeListed();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const KEY_1 = `key-match-${nanoid()}`;
	const KEY_2 = `excluded-${nanoid()}`;
	const KEY_3 = `key-match-${nanoid()}`;
	const KEY_4 = `key-match-${nanoid()}`;
	const KEY_5 = `key-match-${nanoid()}`;

	const addSomeDocsToBeListed = async () => {
		const { set_doc } = actor;

		await set_doc(MOCK_COLLECTION, KEY_1, {
			data: await toArray({
				...mockSputnikObj,
				id: 1n
			}),
			description: toNullable('desc-match'),
			version: toNullable()
		});

		await set_doc(MOCK_COLLECTION, KEY_2, {
			data: await toArray({
				...mockSputnikObj,
				id: 2n
			}),
			description: toNullable('desc-match'),
			version: toNullable()
		});

		await tick(pic);

		await set_doc(MOCK_COLLECTION, KEY_3, {
			data: await toArray({
				...mockSputnikObj,
				id: 3n
			}),
			description: toNullable('excluded'),
			version: toNullable()
		});

		await set_doc(MOCK_COLLECTION, KEY_4, {
			data: await toArray({
				...mockSputnikObj,
				id: 4n
			}),
			description: toNullable('desc-match'),
			version: toNullable()
		});

		const user = Ed25519KeyIdentity.generate();
		actor.setIdentity(user);

		await set_doc(MOCK_COLLECTION, KEY_5, {
			data: await toArray({
				...mockSputnikObj,
				id: 5n
			}),
			description: toNullable('desc-match'),
			version: toNullable()
		});

		actor.setIdentity(controller);
	};

	const setAndGetDoc = async (keySuffix?: string): Promise<Doc> => {
		const { set_doc, get_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: [],
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const result = await get_doc(TEST_COLLECTION, `${key}${keySuffix ?? ''}`);

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
		expect(logs[0][1].message.includes(KEY_4)).toBe(true);
	});
});

import type { Doc } from '$declarations/satellite/satellite.did';
import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj, type SputnikTestListDocs } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > ic-cdk > call', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'demo-ic-cdk-call';
	const MOCK_COLLECTION = 'demo';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
		await set_rule({ Db: null }, MOCK_COLLECTION, mockSetRule);

		await addSomeDocsToBeListed();
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const addSomeDocsToBeListed = async () => {
		const { set_doc } = actor;

		await set_doc(MOCK_COLLECTION, nanoid(), {
			data: await toArray(mockSputnikObj),
			description: toNullable(),
			version: toNullable()
		});

		await set_doc(MOCK_COLLECTION, nanoid(), {
			data: await toArray(mockSputnikObj),
			description: toNullable(),
			version: toNullable()
		});
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

	it('should call with args object and get and object', async () => {
		const doc = await setAndGetDoc();

		const data: SputnikTestListDocs = await fromArray(doc.data);

		expect(data.items_length).toEqual(2n);
		expect(data.matches_length).toEqual(2n);
		expect(data.items_page).toEqual(0n);
	});

	it('should call and get a bigint as result', async () => {
		const doc = await setAndGetDoc('_count_docs');

		const data: bigint = await fromArray(doc.data);

		expect(data).toEqual(2n);
	});

	it('should call without args and get a string as result', async () => {
		const doc = await setAndGetDoc('_version');

		const version: unknown = await fromArray(doc.data);

		expect(typeof version === 'string').toBeTruthy();
	});
});

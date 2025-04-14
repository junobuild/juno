import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import {inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj, type SputnikMock } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > sdk > setDocStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;

	const TEST_COLLECTION = 'test-update';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a } = await setupTestSputnik();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should update document', async () => {
		const { set_doc, get_doc } = actor;

		const key = nanoid();

		await set_doc(TEST_COLLECTION, key, {
			data: await toArray(mockSputnikObj),
			description: toNullable(),
			version: toNullable()
		});

		await waitServerlessFunction(pic);

		const result = await get_doc(TEST_COLLECTION, key);

		const doc = fromNullable(result);

		assertNonNullish(doc);

		const data: SputnikMock = await fromArray(doc.data);

		expect(data.value).toEqual(`${mockSputnikObj.value} (updated)`);
		expect(fromNullable(doc.version)).toEqual(2n);
	});
});

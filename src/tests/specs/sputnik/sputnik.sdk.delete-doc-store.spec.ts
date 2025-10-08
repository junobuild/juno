import { type SputnikActor } from '$lib/api/actors/actor.factory';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > sdk > deleteDocStore', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;

	const TEST_COLLECTION = 'test-deletedoc';

	beforeAll(async () => {
		const { pic: p, actor: a } = await setupTestSputnik();

		pic = p;
		actor = a;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should delete document', async () => {
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

		expect(doc).toBeUndefined();
	});
});

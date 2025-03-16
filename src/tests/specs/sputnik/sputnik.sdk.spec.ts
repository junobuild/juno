import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj, type SputnikMock } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > ic-cdk > id', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'demo-update';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

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

	describe('setDocStore', () => {
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
});

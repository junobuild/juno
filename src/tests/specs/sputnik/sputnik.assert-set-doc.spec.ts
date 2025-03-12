import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs } from '../../utils/mgmt-test.utils';
import { createDoc as createDocUtils } from '../../utils/satellite-doc-tests.utils';
import { waitServerlessFunction } from '../../utils/satellite-extended-tests.utils';

describe('Sputnik > assert_set_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'demo';
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

	it('should not assert document', async () => {
		const key = await createDocUtils({
			actor,
			collection: TEST_ASSERTED_COLLECTION
		});

		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);
		await waitServerlessFunction(pic);

		const logs = await fetchLogs({
			canisterId,
			controller,
			pic
		});

		console.log(logs);
	});
});

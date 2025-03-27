import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { fetchLogs, type IcMgmtLog } from '../../utils/mgmt-test.utils';

describe('Sputnik > assert_delete_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'test-delete-assert';
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

	const deleteAndFetchLogs = async (collection: string): Promise<[string, IcMgmtLog][]> => {
		const { del_doc } = actor;

		const key = nanoid();

		await del_doc(collection, key, {
			version: toNullable()
		});

		return await fetchLogs({
			canisterId,
			controller,
			pic
		});
	};

	it('should not use assertDeleteDoc', async () => {
		const logs = await deleteAndFetchLogs(TEST_NOT_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'assertDeleteDoc called');

		expect(log).toBeUndefined();
	});

	it('should use assertDeleteDoc', async () => {
		const logs = await deleteAndFetchLogs(TEST_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'assertDeleteDoc called');

		expect(log).not.toBeUndefined();
	});

	it('should assert on document not exists', async () => {
		const logs = await deleteAndFetchLogs(TEST_ASSERTED_COLLECTION);

		const log = logs.find(([_, { message }]) => message === 'Document does not exist');

		expect(log).not.toBeUndefined();
	});

});

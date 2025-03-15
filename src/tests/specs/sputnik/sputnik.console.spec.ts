import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { jsonReplacer } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { mockSputnikObj } from '../../mocks/sputnik.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > assert_set_doc', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_ASSERTED_COLLECTION = 'console';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, canisterId: cId, controller: c } = await setupTestSputnik();

		pic = p;
		actor = a;
		canisterId = cId;
		controller = c;

		const { set_rule } = actor;
		await set_rule({ Db: null }, TEST_ASSERTED_COLLECTION, mockSetRule);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setDocAndAssertMsg = async ({
		collection,
		identifier
	}: {
		collection: string;
		identifier: string;
	}) => {
		const { docKey, logs } = await setDocAndFetchLogs({
			collection,
			actor,
			controller,
			canisterId,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(`${identifier}: ${docKey}`));

		expect(log).not.toBeUndefined();
	};

	it('should forward console.log to ic_cdk::print', async () => {
		await setDocAndAssertMsg({
			collection: TEST_ASSERTED_COLLECTION,
			identifier: 'Log'
		});
	});

	it('should forward console.info to ic_cdk::print', async () => {
		await setDocAndAssertMsg({
			collection: TEST_ASSERTED_COLLECTION,
			identifier: 'Info'
		});
	});

	it('should forward console.warn to ic_cdk::print', async () => {
		await setDocAndAssertMsg({
			collection: TEST_ASSERTED_COLLECTION,
			identifier: 'Warn'
		});
	});

	it('should forward console.error to ic_cdk::print', async () => {
		await setDocAndAssertMsg({
			collection: TEST_ASSERTED_COLLECTION,
			identifier: 'Error'
		});
	});

	it('should serialize types no supported natively by JSON.stringify', async () => {
		const { logs } = await setDocAndFetchLogs({
			collection: TEST_ASSERTED_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const obj = JSON.stringify(mockSputnikObj, jsonReplacer);

		const log = logs.find(([_, { message }]) => message.includes(`Log and serialize: ${obj}`));

		expect(log).not.toBeUndefined();
	});
});

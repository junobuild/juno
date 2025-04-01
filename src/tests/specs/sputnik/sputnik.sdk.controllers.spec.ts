import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, jsonReplacer, jsonReviver } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > controllers', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-sdk-controllers';

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { pic: p, actor: a, controller: c, canisterId: cId } = await setupTestSputnik();

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

	describe('controller', () => {
		const caller = (): string =>
			JSON.stringify(controller.getPrincipal().toUint8Array(), jsonReplacer);

		it('should be the caller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) => message.includes(`caller: ${caller()}`));
			expect(log).not.toBeUndefined();
		});

		it('should be a controller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) => message.includes('isController: true'));
			expect(log).not.toBeUndefined();
		});

		it('should be an admin controller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) => message.includes('isAdminController: true'));
			expect(log).not.toBeUndefined();
		});

		const assertControllers = async ({ keyword }: { keyword: string }) => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) => message.includes(keyword));

			assertNonNullish(log);

			const { message } = log[1];

			const data = JSON.parse(message.replace(`${keyword}:`, '').trim(), jsonReviver);

			expect(Principal.fromUint8Array(data[0][0]).toText()).toEqual(
				controller.getPrincipal().toText()
			);

			const controllerData = data[0][1];

			expect(controllerData.metadata).toEqual([]);
			expect(controllerData.created_at).not.toBeUndefined();
			expect(controllerData.created_at).toBeGreaterThan(0n);
			expect(controllerData.updated_at).not.toBeUndefined();
			expect(controllerData.updated_at).toBeGreaterThan(0n);
			expect(controllerData.scope).toEqual('admin');
		};

		it('should get controllers', async () => {
			const keyword = 'getControllers';

			await assertControllers({ keyword });
		});

		it('should get admin controllers', async () => {
			const keyword = 'getControllers';

			await assertControllers({ keyword });
		});
	});
});

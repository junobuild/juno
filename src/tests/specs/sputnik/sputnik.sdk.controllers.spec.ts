import type { Controller } from '$declarations/satellite/satellite.did';
import type { _SERVICE as SputnikActor } from '$declarations/sputnik/sputnik.did';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, jsonReplacer, jsonReviver } from '@dfinity/utils';
import { type Actor, type PocketIc } from '@hadronous/pic';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { createUser as createUserUtils } from '../../utils/satellite-doc-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > controllers', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-sdk-controllers';

	const assertControllers = async ({
		keyword
	}: {
		keyword: string;
	}): Promise<[Uint8Array, Controller][]> => {
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

		const data: [Uint8Array, Controller][] = JSON.parse(
			message.replace(`${keyword}:`, '').trim(),
			jsonReviver
		);

		const controllerData = data.find(
			(c) => Principal.fromUint8Array(c[0]).toText() === controller.getPrincipal().toText()
		);

		assertNonNullish(controllerData);

		const controllerMetadata = controllerData[1];

		expect(controllerMetadata.metadata).toEqual([]);
		expect(controllerMetadata.created_at).not.toBeUndefined();
		expect(controllerMetadata.created_at).toBeGreaterThan(0n);
		expect(controllerMetadata.updated_at).not.toBeUndefined();
		expect(controllerMetadata.updated_at).toBeGreaterThan(0n);
		expect(controllerMetadata.scope).toEqual('admin');

		return data;
	};

	beforeAll(async () => {
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

		const callerText = (): string => `[${controller.getPrincipal().toText()}]`;

		it('should be the caller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} caller: ${caller()}`)
			);

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

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isController: true`)
			);

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

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isAdminController: true`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should get controllers', async () => {
			const keyword = `${callerText()} getControllers`;

			await assertControllers({ keyword });
		});

		it('should get admin controllers', async () => {
			const keyword = `${callerText()} getAdminControllers`;

			await assertControllers({ keyword });
		});
	});

	describe('user', () => {
		let user: Identity;

		beforeAll(async () => {
			const { user: u } = await createUserUtils({ actor });
			user = u;

			actor.setIdentity(user);
		});

		const caller = (): string => JSON.stringify(user.getPrincipal().toUint8Array(), jsonReplacer);

		const callerText = (): string => `[${user.getPrincipal().toText()}]`;

		it('should be the caller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} caller: ${caller()}`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should not be a controller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isController: false`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should not be an admin controller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isAdminController: false`)
			);

			expect(log).not.toBeUndefined();
		});
	});

	describe('anoter controller', () => {
		let user: Identity;

		beforeAll(async () => {
			const { user: u } = await createUserUtils({ actor });
			user = u;

			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					scope: { Write: null },
					metadata: [['hello', 'world']],
					expires_at: []
				},
				controllers: [user.getPrincipal()]
			});

			actor.setIdentity(user);
		});

		const caller = (): string => JSON.stringify(user.getPrincipal().toUint8Array(), jsonReplacer);

		const callerText = (): string => `[${user.getPrincipal().toText()}]`;

		it('should be the caller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} caller: ${caller()}`)
			);

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

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isController: true`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should not be an admin controller', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isAdminController: false`)
			);

			expect(log).not.toBeUndefined();
		});

		const assertWriteController = async ({ keyword }: { keyword: string }) => {
			const data = await assertControllers({ keyword });

			const controllerData = data.find(
				(c) => Principal.fromUint8Array(c[0]).toText() === user.getPrincipal().toText()
			);

			assertNonNullish(controllerData);

			const controllerMetadata = controllerData[1];

			expect(controllerMetadata.metadata).toEqual([['hello', 'world']]);
			expect(controllerMetadata.created_at).not.toBeUndefined();
			expect(controllerMetadata.created_at).toBeGreaterThan(0n);
			expect(controllerMetadata.updated_at).not.toBeUndefined();
			expect(controllerMetadata.updated_at).toBeGreaterThan(0n);
			expect(controllerMetadata.scope).toEqual('write');
		};

		it('should get controllers', async () => {
			const keyword = `${callerText()} getControllers`;

			await assertWriteController({ keyword });
		});

		it('should get admin controllers', async () => {
			const keyword = `${callerText()} getAdminControllers`;

			const data = await assertControllers({ keyword });

			actor.setIdentity(controller);

			const { list_controllers } = actor;

			const controllers = await list_controllers();

			expect(data).toHaveLength(controllers.filter((c) => 'Admin' in c[1].scope).length);
		});
	});
});

import type { SputnikActor, SputnikDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, jsonReplacer, jsonReviver } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';
import { CONTROLLER_METADATA } from '../../constants/controller-tests.constants';
import { mockSetRule } from '../../mocks/collection.mocks';
import { setupTestSputnik } from '../../utils/fixtures-tests.utils';
import { createUser as createUserUtils } from '../../utils/satellite-doc-tests.utils';
import { setDocAndFetchLogs } from '../../utils/sputnik-tests.utils';

describe('Sputnik > sdk > access keys', () => {
	let pic: PocketIc;
	let actor: Actor<SputnikActor>;
	let canisterId: Principal;
	let controller: Identity;

	const TEST_COLLECTION = 'test-sdk-access-keys';

	const assertAccessKeys = async ({
		keyword
	}: {
		keyword: string;
	}): Promise<[Uint8Array, SputnikDid.AccessKey][]> => {
		const { logs } = await setDocAndFetchLogs({
			collection: TEST_COLLECTION,
			actor,
			controller,
			canisterId,
			pic
		});

		const log = logs.find(([_, { message }]) => message.includes(keyword));

		assertNonNullish(log);

		const [_, { message }] = log;

		const data: [Uint8Array, SputnikDid.AccessKey][] = JSON.parse(
			message.replace(`${keyword}:`, '').trim(),
			jsonReviver
		);

		const accessKeyData = data.find(
			(c) => Principal.fromUint8Array(c[0]).toText() === controller.getPrincipal().toText()
		);

		assertNonNullish(accessKeyData);

		const [__, accessKeyMetadata] = accessKeyData;

		expect(accessKeyMetadata.metadata).toEqual([]);
		expect(accessKeyMetadata.created_at).not.toBeUndefined();
		expect(accessKeyMetadata.created_at).toBeGreaterThan(0n);
		expect(accessKeyMetadata.updated_at).not.toBeUndefined();
		expect(accessKeyMetadata.updated_at).toBeGreaterThan(0n);
		expect(accessKeyMetadata.scope).toEqual('admin');

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

	describe('accessKey', () => {
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

		it('should be a access key', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isValidAccessKey: true`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should be a access key with write permission', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isWriteAccessKey: true`)
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

		it('should get access keys', async () => {
			const keyword = `${callerText()} getAccessKeys`;

			await assertAccessKeys({ keyword });
		});

		it('should get admin access keys', async () => {
			const keyword = `${callerText()} getAdminAccessKeys`;

			await assertAccessKeys({ keyword });
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

		it('should not be a access key', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isValidAccessKey: false`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should not be a access key with write permission', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isWriteAccessKey: false`)
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

	describe('other access key with write', () => {
		let user: Identity;

		const createAccessKey = async (scope: SputnikDid.AccessKeyScope) => {
			const { user: u } = await createUserUtils({ actor });
			user = u;

			actor.setIdentity(controller);

			const { set_controllers } = actor;

			await set_controllers({
				controller: {
					...CONTROLLER_METADATA,
					scope,
					metadata: [['hello', 'world']]
				},
				controllers: [user.getPrincipal()]
			});

			actor.setIdentity(user);
		};

		const caller = (): string => JSON.stringify(user.getPrincipal().toUint8Array(), jsonReplacer);

		const callerText = (): string => `[${user.getPrincipal().toText()}]`;

		const assertWriteAccessKey = async ({ keyword }: { keyword: string }) => {
			const data = await assertAccessKeys({ keyword });

			const accessKeyData = data.find(
				(c) => Principal.fromUint8Array(c[0]).toText() === user.getPrincipal().toText()
			);

			assertNonNullish(accessKeyData);

			const [___, accessKeyMetadata] = accessKeyData;

			expect(accessKeyMetadata.metadata).toEqual([['hello', 'world']]);
			expect(accessKeyMetadata.created_at).not.toBeUndefined();
			expect(accessKeyMetadata.created_at).toBeGreaterThan(0n);
			expect(accessKeyMetadata.updated_at).not.toBeUndefined();
			expect(accessKeyMetadata.updated_at).toBeGreaterThan(0n);
			expect(accessKeyMetadata.scope).toEqual('write');
		};

		beforeAll(async () => {
			await createAccessKey({ Write: null });
		});

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

		it('should be a access key', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isValidAccessKey: true`)
			);

			expect(log).not.toBeUndefined();
		});

		it('should be a access key with write permission', async () => {
			const { logs } = await setDocAndFetchLogs({
				collection: TEST_COLLECTION,
				actor,
				controller,
				canisterId,
				pic
			});

			const log = logs.find(([_, { message }]) =>
				message.includes(`${callerText()} isWriteAccessKey: true`)
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

		it('should get accessKeys', async () => {
			const keyword = `${callerText()} getAccessKeys`;

			await assertWriteAccessKey({ keyword });
		});

		it('should get admin access keys', async () => {
			const keyword = `${callerText()} getAdminAccessKeys`;

			const data = await assertAccessKeys({ keyword });

			actor.setIdentity(controller);

			const { list_controllers } = actor;

			const accessKeys = await list_controllers();

			expect(data).toHaveLength(accessKeys.filter((c) => 'Admin' in c[1].scope).length);
		});
	});
});

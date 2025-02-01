import type {
	DelDoc,
	ListParams,
	_SERVICE as SatelliteActor,
	SetDoc,
	SetRule,
	UserUsage
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, expect, inject } from 'vitest';
import { controllersInitArgs, SATELLITE_WASM_PATH } from './utils/setup-tests.utils';

describe('Satellite User Usage', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	const TEST_COLLECTION = 'test';

	const setRule: SetRule = {
		memory: toNullable({ Heap: null }),
		max_size: toNullable(),
		max_capacity: toNullable(),
		read: { Managed: null },
		mutable_permissions: toNullable(),
		write: { Managed: null },
		version: toNullable(),
		rate_config: toNullable()
	};

	const NO_FILTER_PARAMS: ListParams = {
		matcher: toNullable(),
		order: toNullable(),
		owner: toNullable(),
		paginate: toNullable()
	};

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;

		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Datastore', async () => {
		const data = await toArray({
			hello: 'World'
		});

		beforeAll(async () => {
			const { set_rule } = actor;
			await set_rule({ Db: null }, TEST_COLLECTION, setRule);
		});

		const createDoc = async (): Promise<string> => {
			const key = nanoid();

			const { set_doc } = actor;

			await set_doc(TEST_COLLECTION, key, {
				data,
				description: toNullable(),
				version: toNullable()
			});

			return key;
		};

		describe('User', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const countSetDocs = 10;

			it('should get a usage count after set documents', async () => {
				await Promise.all(Array.from({ length: countSetDocs }).map(createDoc));

				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable());

				const usage = fromNullable(usageResponse);

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(countSetDocs);

				expect(usage.updated_at).not.toBeUndefined();
				expect(usage.updated_at).toBeGreaterThan(0n);
				expect(usage.created_at).not.toBeUndefined();
				expect(usage.created_at).toBeGreaterThan(0n);
				expect(usage.updated_at).toBeGreaterThan(usage.created_at);

				expect(usage.version).toEqual(toNullable(BigInt(countSetDocs)));
			});

			const countSetManyDocs = 5;

			it('should get a usage count after set many documents', async () => {
				const { set_many_docs } = actor;

				const docs: [string, string, SetDoc][] = Array.from({ length: countSetManyDocs }).map(
					() => [
						TEST_COLLECTION,
						nanoid(),
						{
							data,
							description: toNullable(),
							version: toNullable()
						}
					]
				);

				await set_many_docs(docs);

				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable());

				const usage = fromNullable(usageResponse);

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(countSetManyDocs + countSetDocs);
				expect(usage.version).toEqual(toNullable(BigInt(countSetManyDocs + countSetDocs)));
			});

			const countDelDoc = 1;

			it('should get a usage count after delete document', async () => {
				const { del_doc, list_docs } = actor;

				const { items } = await list_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				const doc = items[0][1];

				await del_doc(TEST_COLLECTION, items[0][0], {
					version: doc.version ?? []
				});

				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable());

				const usage = fromNullable(usageResponse);

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(countSetManyDocs + countSetDocs - countDelDoc);
				expect(usage.version).toEqual(
					toNullable(BigInt(countSetManyDocs + countSetDocs + countDelDoc))
				);
			});

			const countDelManyDocs = 2;

			it('should get a usage count after delete many documents', async () => {
				const { del_many_docs, list_docs } = actor;

				const { items } = await list_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				const docs: [string, string, DelDoc][] = [items[0], items[1]].map(([key, doc]) => [
					TEST_COLLECTION,
					key,
					{
						version: doc.version ?? []
					}
				]);

				await del_many_docs(docs);

				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable());

				const usage = fromNullable(usageResponse);

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(
					countSetManyDocs + countSetDocs - countDelDoc - countDelManyDocs
				);
				expect(usage.version).toEqual(
					toNullable(BigInt(countSetManyDocs + countSetDocs + countDelDoc + countDelManyDocs))
				);
			});

			it('should get a usage count after delete filtered docs', async () => {
				const { del_filtered_docs } = actor;

				await del_filtered_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable());

				const usage = fromNullable(usageResponse);

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(0);
				expect(usage.version).toEqual(
					toNullable(BigInt(countSetManyDocs + countSetDocs + countDelDoc + countDelManyDocs + 1))
				);
			});
		});

		describe('Guards', () => {
			const user1 = Ed25519KeyIdentity.generate();

			const fetchUsage = async (userId?: Principal): Promise<UserUsage | undefined> => {
				const { get_user_usage } = actor;

				const usageResponse = await get_user_usage(TEST_COLLECTION, toNullable(userId));
				return fromNullable(usageResponse);
			};

			it('should not get usage of another user', async () => {
				actor.setIdentity(user1);

				await createDoc();

				const usage = await fetchUsage();

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(1);

				const user2 = Ed25519KeyIdentity.generate();

				actor.setIdentity(user2);

				const usage2 = await fetchUsage(user1.getPrincipal());

				expect(usage2).toBeUndefined();
			});

			it('should get usage of user if controller', async () => {
				actor.setIdentity(controller);

				const usage = await fetchUsage(user1.getPrincipal());

				assertNonNullish(usage);

				expect(usage.items_count).toEqual(1);
			});
		});
	});
});

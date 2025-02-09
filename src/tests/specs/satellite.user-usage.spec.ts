import type {
	CollectionType,
	DelDoc,
	Doc,
	ListParams,
	_SERVICE as SatelliteActor,
	SetDoc,
	SetRule
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { beforeAll, describe, expect, inject } from 'vitest';
import { SATELLITE_ADMIN_ERROR_MSG } from './constants/satellite-tests.constants';
import { mockData } from './mocks/doc.mocks';
import { createDoc as createDocUtils } from './utils/satellite-doc-tests.utils';
import { uploadAsset } from './utils/satellite-storage-tests.utils';
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
		rate_config: toNullable(),
		max_changes_per_user: toNullable()
	};

	const NO_FILTER_PARAMS: ListParams = {
		matcher: toNullable(),
		order: toNullable(),
		owner: toNullable(),
		paginate: toNullable()
	};

	interface UserUsage {
		changes_count: number;
	}

	const get_user_usage = async (
		collection: string,
		collectionType: CollectionType,
		userId: Principal
	): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> => {
		const { get_doc } = actor;

		const key = `${userId.toText()}#${'Storage' in collectionType ? 'storage' : 'db'}#${collection}`;

		const result = await get_doc('#user-usage', key);

		const doc = fromNullable(result);

		const usage = isNullish(doc) ? undefined : await fromArray<UserUsage>(doc.data);

		return {
			doc,
			usage
		};
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

	describe('Datastore', () => {
		const COLLECTION_TYPE = { Db: null };

		beforeAll(async () => {
			const { set_rule } = actor;
			await set_rule(COLLECTION_TYPE, TEST_COLLECTION, setRule);
		});

		const createDoc = (): Promise<string> =>
			createDocUtils({
				actor,
				collection: TEST_COLLECTION
			});

		const user = Ed25519KeyIdentity.generate();
		let countTotalChanges: number;

		describe('User', () => {
			beforeAll(() => {
				actor.setIdentity(user);
			});

			const countSetDocs = 10;

			it('should get a usage count after set documents', async () => {
				await Promise.all(Array.from({ length: countSetDocs }).map(createDoc));

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countSetDocs);

				expect(doc.updated_at).not.toBeUndefined();
				expect(doc.updated_at).toBeGreaterThan(0n);
				expect(doc.created_at).not.toBeUndefined();
				expect(doc.created_at).toBeGreaterThan(0n);
				expect(doc.updated_at).toBeGreaterThan(doc.created_at);

				expect(doc.version).toEqual(toNullable(BigInt(countSetDocs)));
			});

			const countSetManyDocs = 5;

			it('should get a usage count after set many documents', async () => {
				const { set_many_docs } = actor;

				const docs: [string, string, SetDoc][] = Array.from({ length: countSetManyDocs }).map(
					() => [
						TEST_COLLECTION,
						nanoid(),
						{
							data: mockData,
							description: toNullable(),
							version: toNullable()
						}
					]
				);

				await set_many_docs(docs);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countSetManyDocs + countSetDocs);
				expect(doc.version).toEqual(toNullable(BigInt(countSetManyDocs + countSetDocs)));
			});

			const countDelDoc = 1;

			it('should get a usage count after delete document', async () => {
				const { del_doc, list_docs } = actor;

				const { items } = await list_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				const doc = items[0][1];

				await del_doc(TEST_COLLECTION, items[0][0], {
					version: doc.version ?? []
				});

				const { doc: docRead, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(docRead);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countSetManyDocs + countSetDocs + countDelDoc);
				expect(docRead.version).toEqual(
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

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(
					countSetManyDocs + countSetDocs + countDelDoc + countDelManyDocs
				);
				expect(doc.version).toEqual(
					toNullable(BigInt(countSetManyDocs + countSetDocs + countDelDoc + countDelManyDocs))
				);
			});

			it('should get a usage count after delete filtered docs', async () => {
				const { del_filtered_docs } = actor;

				await del_filtered_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				const countRemainingDocs = countSetManyDocs + countSetDocs - countDelDoc - countDelManyDocs;

				countTotalChanges =
					countSetManyDocs + countSetDocs + countDelDoc + countDelManyDocs + countRemainingDocs;

				expect(usage.changes_count).toEqual(countTotalChanges);
				expect(doc.version).toEqual(toNullable(BigInt(countTotalChanges)));
			});
		});

		describe('Guards', () => {
			const user1 = Ed25519KeyIdentity.generate();

			const fetchUsage = async (
				userId?: Principal
			): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> => {
				return await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					userId ?? user.getPrincipal()
				);
			};

			it('should not get usage of another user', async () => {
				actor.setIdentity(user1);

				await createDoc();

				const { usage } = await fetchUsage();

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);

				const user2 = Ed25519KeyIdentity.generate();

				actor.setIdentity(user2);

				const usage2 = await fetchUsage(user1.getPrincipal());

				expect(usage2).toBeUndefined();
			});

			it('should get usage of user if controller', async () => {
				actor.setIdentity(controller);

				const { usage } = await fetchUsage(user1.getPrincipal());

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);
			});

			it('should throw errors on set usage', async () => {
				actor.setIdentity(user1);

				const { set_doc } = actor;

				const key = `${user1.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 345
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc(key, key, doc)).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
			});
		});

		describe('No user usage', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should get no usage of collection is log', async () => {
				const { set_doc, get_doc } = actor;

				const key = nanoid();

				await set_doc('#log', key, {
					data: mockData,
					description: toNullable(),
					version: toNullable()
				});

				const doc = await get_doc('#log', key);
				expect(fromNullable(doc)).not.toBeUndefined();

				const { doc: usageDoc } = await get_user_usage(
					'#log',
					COLLECTION_TYPE,
					controller.getPrincipal()
				);
				expect(usageDoc).toBeUndefined();
			});
		});

		describe('Admin', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should set usage for user', async () => {
				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 345
					}),
					description: toNullable(),
					version: toNullable()
				};

				const usage = await set_doc(TEST_COLLECTION, key, doc);

				const usageData = await fromArray<UserUsage>(usage.data);

				expect(usageData.changes_count).toEqual(345);

				expect(usage.updated_at).not.toBeUndefined();
				expect(usage.updated_at).toBeGreaterThan(0n);
				expect(usage.created_at).not.toBeUndefined();
				expect(usage.created_at).toBeGreaterThan(0n);
				expect(usage.updated_at).toBeGreaterThan(usage.created_at);

				expect(usage.version).toEqual(toNullable(BigInt(countTotalChanges + 1)));
			});
		});
	});

	describe('Storage', () => {
		const COLLECTION_TYPE = { Storage: null };

		beforeAll(async () => {
			actor.setIdentity(controller);

			const { set_rule } = actor;
			await set_rule(COLLECTION_TYPE, TEST_COLLECTION, setRule);
		});

		const upload = async (index: number) => {
			const name = `hello-${index}.html`;
			const full_path = `/${TEST_COLLECTION}/${name}`;

			await uploadAsset({
				full_path,
				name,
				collection: TEST_COLLECTION,
				actor
			});
		};

		const createUser = async (user: Principal) => {
			// We need a user entry to upload to the storage, there is a guard
			const { set_doc } = actor;

			await set_doc('#user', user.toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				version: toNullable()
			});
		};

		const user = Ed25519KeyIdentity.generate();
		let countTotalChanges: number;

		describe('User', () => {
			beforeAll(async () => {
				actor.setIdentity(user);

				await createUser(user.getPrincipal());
			});

			const countUploadAssets = 10;

			it('should get a usage count after update asset', async () => {
				await Promise.all(
					Array.from({ length: countUploadAssets }).map(async (_, i) => await upload(i))
				);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countUploadAssets);

				expect(doc.updated_at).not.toBeUndefined();
				expect(doc.updated_at).toBeGreaterThan(0n);
				expect(doc.created_at).not.toBeUndefined();
				expect(doc.created_at).toBeGreaterThan(0n);
				expect(doc.updated_at).toBeGreaterThan(doc.created_at);

				expect(doc.version).toEqual(toNullable(BigInt(countUploadAssets)));
			});

			const countDelAsset = 1;

			it('should get a usage count after delete one asset', async () => {
				const { del_asset, list_assets } = actor;

				const { items } = await list_assets(TEST_COLLECTION, NO_FILTER_PARAMS);

				const asset = items[0][1];

				await del_asset(TEST_COLLECTION, asset.key.full_path);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countUploadAssets + countDelAsset);
				expect(doc.version).toEqual(toNullable(BigInt(countUploadAssets + countDelAsset)));
			});

			const countDelManyAssets = 2;

			it('should get a usage count after delete many assets', async () => {
				const { del_many_assets, list_assets } = actor;

				const { items } = await list_assets(TEST_COLLECTION, NO_FILTER_PARAMS);

				const assets: [string, string][] = [items[0], items[1]].map(([_, asset]) => [
					TEST_COLLECTION,
					asset.key.full_path
				]);

				await del_many_assets(assets);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countUploadAssets + countDelAsset + countDelManyAssets);
				expect(doc.version).toEqual(
					toNullable(BigInt(countUploadAssets + countDelAsset + countDelManyAssets))
				);
			});

			it('should get a usage count after delete filtered assets', async () => {
				const { del_filtered_assets } = actor;

				await del_filtered_assets(TEST_COLLECTION, NO_FILTER_PARAMS);

				const { doc, usage } = await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					user.getPrincipal()
				);

				assertNonNullish(doc);
				assertNonNullish(usage);

				const countRemainingAssets = countUploadAssets - countDelAsset - countDelManyAssets;

				countTotalChanges =
					countUploadAssets + countDelAsset + countDelManyAssets + countRemainingAssets;

				expect(usage.changes_count).toEqual(countTotalChanges);
				expect(doc.version).toEqual(toNullable(BigInt(countTotalChanges)));
			});
		});

		describe('Guards', () => {
			const user1 = Ed25519KeyIdentity.generate();

			beforeAll(async () => {
				actor.setIdentity(user1);
				await createUser(user1.getPrincipal());
			});

			const fetchUsage = async (
				userId?: Principal
			): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> => {
				return await get_user_usage(
					TEST_COLLECTION,
					COLLECTION_TYPE,
					userId ?? user.getPrincipal()
				);
			};

			it('should not get usage of another user', async () => {
				await upload(100);

				const { usage } = await fetchUsage();

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);

				const user2 = Ed25519KeyIdentity.generate();

				actor.setIdentity(user2);
				await createUser(user2.getPrincipal());

				const usage2 = await fetchUsage(user1.getPrincipal());

				expect(usage2).toBeUndefined();
			});

			it('should get usage of user if controller', async () => {
				actor.setIdentity(controller);

				const { usage } = await fetchUsage(user1.getPrincipal());

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);
			});

			it('should throw errors on set usage', async () => {
				actor.setIdentity(user1);

				const { set_doc } = actor;

				const key = `${user1.getPrincipal().toText()}#storage#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 345
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc(key, key, doc)).rejects.toThrow(SATELLITE_ADMIN_ERROR_MSG);
			});
		});

		describe('No user usage', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should get no usage of collection is dapp', async () => {
				const { get_asset } = actor;

				const name = `index.html`;
				const full_path = `/${name}`;

				await uploadAsset({
					full_path,
					name,
					collection: '#dapp',
					actor
				});

				const asset = await get_asset('#dapp', full_path);
				expect(fromNullable(asset)).not.toBeUndefined();

				const { doc: usageDoc } = await get_user_usage(
					'#dapp',
					COLLECTION_TYPE,
					controller.getPrincipal()
				);
				expect(usageDoc).toBeUndefined();
			});
		});

		describe('Admin', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should set usage for user', async () => {
				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 456
					}),
					description: toNullable(),
					version: toNullable()
				};

				const usage = await set_doc(TEST_COLLECTION, key, doc);

				const usageData = await fromArray<UserUsage>(usage.data);

				expect(usageData.changes_count).toEqual(345);

				expect(usage.updated_at).not.toBeUndefined();
				expect(usage.updated_at).toBeGreaterThan(0n);
				expect(usage.created_at).not.toBeUndefined();
				expect(usage.created_at).toBeGreaterThan(0n);
				expect(usage.updated_at).toBeGreaterThan(usage.created_at);

				expect(usage.version).toEqual(toNullable(BigInt(countTotalChanges + 1)));
			});
		});
	});
});

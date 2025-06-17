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
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish, toNullable } from '@dfinity/utils';
import {
	JUNO_DATASTORE_ERROR_CANNOT_WRITE,
	JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA
} from '@junobuild/errors';
import { fromArray, toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { beforeAll, describe, expect, inject } from 'vitest';
import { mockData } from '../../../mocks/doc.mocks';
import { tick } from '../../../utils/pic-tests.utils';
import { createDoc as createDocUtils } from '../../../utils/satellite-doc-tests.utils';
import { uploadAsset } from '../../../utils/satellite-storage-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > User Usage', () => {
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

	const get_user_usage = async ({
		collection,
		collectionType,
		userId,
		actorIdentity
	}: {
		collection: string;
		collectionType: CollectionType;
		userId: Principal;
		actorIdentity?: Identity;
	}): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> => {
		actor.setIdentity(actorIdentity ?? controller);

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

	const upload = async ({ index, collection }: { index: number; collection?: string }) => {
		const name = `hello-${index}.html`;
		const full_path = `/${collection ?? TEST_COLLECTION}/${name}`;

		await uploadAsset({
			full_path,
			name,
			collection: collection ?? TEST_COLLECTION,
			actor
		});
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

		describe('User interactions', () => {
			beforeEach(() => {
				actor.setIdentity(user);
			});

			const countSetDocs = 10;

			it('should get a usage count after set documents', async () => {
				await Promise.all(Array.from({ length: countSetDocs }).map(createDoc));

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

				assertNonNullish(doc);
				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(countSetManyDocs + countSetDocs);
				expect(doc.version).toEqual(toNullable(BigInt(countSetManyDocs + countSetDocs)));
			});

			const countDelDoc = 1;

			it('should get a usage count after delete document', async () => {
				const { del_doc, list_docs } = actor;

				const { items } = await list_docs(TEST_COLLECTION, NO_FILTER_PARAMS);

				// eslint-disable-next-line prefer-destructuring
				const doc = items[0][1];

				await del_doc(TEST_COLLECTION, items[0][0], {
					version: doc.version ?? []
				});

				const { doc: docRead, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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
			const user = Ed25519KeyIdentity.generate();

			const fetchUsage = async (
				actorIdentity?: Identity
			): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> =>
				await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal(),
					actorIdentity
				});

			it('should not get usage', async () => {
				actor.setIdentity(user);

				await createDoc();

				const { usage } = await fetchUsage(user);

				expect(usage).toBeUndefined();
			});

			it('should get usage of user if controller', async () => {
				actor.setIdentity(controller);

				const { usage } = await fetchUsage();

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);
			});

			it('should throw errors on set usage', async () => {
				actor.setIdentity(user);

				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 345
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
					JUNO_DATASTORE_ERROR_CANNOT_WRITE
				);
			});
		});

		describe('No user usage', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should not track usage for collection #log', async () => {
				const { set_doc, get_doc } = actor;

				const key = nanoid();

				await set_doc('#log', key, {
					data: mockData,
					description: toNullable(),
					version: toNullable()
				});

				const doc = await get_doc('#log', key);

				expect(fromNullable(doc)).not.toBeUndefined();

				const { doc: usageDoc } = await get_user_usage({
					collection: '#log',
					collectionType: COLLECTION_TYPE,
					userId: controller.getPrincipal()
				});

				expect(usageDoc).toBeUndefined();
			});

			it('should not track usage for collection #user-usage', async () => {
				const user = Ed25519KeyIdentity.generate();
				actor.setIdentity(user);

				const { set_doc, get_doc } = actor;

				const key = user.getPrincipal().toText();

				const data = await toArray({});

				await set_doc('#user', key, {
					data,
					description: toNullable(),
					version: toNullable()
				});

				const doc = await get_doc('#user', key);

				expect(fromNullable(doc)).not.toBeUndefined();

				const { doc: usageDoc } = await get_user_usage({
					collection: '#user',
					collectionType: COLLECTION_TYPE,
					userId: controller.getPrincipal()
				});

				expect(usageDoc).toBeUndefined();
			});

			it('should not track usage for collection #user', async () => {
				const { set_doc, get_doc } = actor;

				const key = nanoid();

				await set_doc('#log', key, {
					data: mockData,
					description: toNullable(),
					version: toNullable()
				});

				const doc = await get_doc('#log', key);

				expect(fromNullable(doc)).not.toBeUndefined();

				const { doc: usageDoc } = await get_user_usage({
					collection: '#log',
					collectionType: COLLECTION_TYPE,
					userId: controller.getPrincipal()
				});

				expect(usageDoc).toBeUndefined();
			});
		});

		describe('Admin', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			describe('success', () => {
				it('should set usage for user', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 345
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					const usage = await set_doc('#user-usage', key, doc);

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

			describe('error', () => {
				it('should not set usage with invalid type', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 'invalid'
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
						new RegExp(
							`${JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA}: invalid type: string "invalid", expected u32 at line 1 column 26.`,
							'i'
						)
					);
				});

				it('should not set usage with invalid additional data fields', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#db#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 432,
							unknown: 'field'
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
						new RegExp(
							`${JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA}: unknown field \`unknown\`, expected \`changes_count\` at line 1 column 30.`,
							'i'
						)
					);
				});
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

		const user = Ed25519KeyIdentity.generate();
		let countTotalChanges: number;

		describe('User interactions', () => {
			beforeAll(async () => {
				actor.setIdentity(user);

				await createUser(user.getPrincipal());
			});

			beforeEach(() => {
				actor.setIdentity(user);
			});

			const countUploadAssets = 10;

			it('should get a usage count after update asset', async () => {
				await Promise.all(
					Array.from({ length: countUploadAssets }).map(async (_, index) => await upload({ index }))
				);

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				// eslint-disable-next-line prefer-destructuring
				const asset = items[0][1];

				await del_asset(TEST_COLLECTION, asset.key.full_path);

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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

				const { doc, usage } = await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal()
				});

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
			const user = Ed25519KeyIdentity.generate();

			beforeAll(async () => {
				actor.setIdentity(user);
				await createUser(user.getPrincipal());
			});

			const fetchUsage = async (
				actorIdentity?: Identity
			): Promise<{ doc: Doc | undefined; usage: UserUsage | undefined }> =>
				await get_user_usage({
					collection: TEST_COLLECTION,
					collectionType: COLLECTION_TYPE,
					userId: user.getPrincipal(),
					actorIdentity
				});

			it('should not get usage', async () => {
				actor.setIdentity(user);

				await upload({ index: 100 });

				const { usage } = await fetchUsage(user);

				expect(usage).toBeUndefined();
			});

			it('should get usage of user if controller', async () => {
				actor.setIdentity(controller);

				const { usage } = await fetchUsage();

				assertNonNullish(usage);

				expect(usage.changes_count).toEqual(1);
			});

			it('should throw errors on set usage', async () => {
				actor.setIdentity(user);

				const { set_doc } = actor;

				const key = `${user.getPrincipal().toText()}#storage#${TEST_COLLECTION}`;

				const doc: SetDoc = {
					data: await toArray({
						changes_count: 345
					}),
					description: toNullable(),
					version: toNullable()
				};

				await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
					JUNO_DATASTORE_ERROR_CANNOT_WRITE
				);
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

				const { doc: usageDoc } = await get_user_usage({
					collection: '#dapp',
					collectionType: COLLECTION_TYPE,
					userId: controller.getPrincipal()
				});

				expect(usageDoc).toBeUndefined();
			});
		});

		describe('Admin', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			describe('success', () => {
				it('should set usage for user', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#storage#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 456
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					const usage = await set_doc('#user-usage', key, doc);

					const usageData = await fromArray<UserUsage>(usage.data);

					expect(usageData.changes_count).toEqual(456);

					expect(usage.updated_at).not.toBeUndefined();
					expect(usage.updated_at).toBeGreaterThan(0n);
					expect(usage.created_at).not.toBeUndefined();
					expect(usage.created_at).toBeGreaterThan(0n);
					expect(usage.updated_at).toBeGreaterThan(usage.created_at);

					expect(usage.version).toEqual(toNullable(BigInt(countTotalChanges + 1)));
				});
			});

			describe('error', () => {
				it('should not set usage with invalid type', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#storage#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 'invalid'
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
						new RegExp(
							`${JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA}: invalid type: string "invalid", expected u32 at line 1 column 26.`,
							'i'
						)
					);
				});

				it('should not set usage with invalid additional data fields', async () => {
					const { set_doc, get_doc } = actor;

					const key = `${user.getPrincipal().toText()}#storage#${TEST_COLLECTION}`;

					const currentDoc = await get_doc('#user-usage', key);

					const doc: SetDoc = {
						data: await toArray({
							changes_count: 432,
							unknown: 'field'
						}),
						description: toNullable(),
						version: fromNullable(currentDoc)?.version ?? []
					};

					await expect(set_doc('#user-usage', key, doc)).rejects.toThrow(
						new RegExp(
							`${JUNO_DATASTORE_ERROR_USER_USAGE_INVALID_DATA}: unknown field \`unknown\`, expected \`changes_count\` at line 1 column 30.`,
							'i'
						)
					);
				});
			});
		});
	});

	describe('Clean-up', () => {
		let user: Identity;

		beforeEach(async () => {
			user = Ed25519KeyIdentity.generate();

			actor.setIdentity(user);

			await createUser(user.getPrincipal());
		});

		const createCollections = async (collection: string) => {
			actor.setIdentity(controller);

			const { set_rule } = actor;
			await set_rule({ Db: null }, collection, setRule);
			await set_rule({ Storage: null }, collection, setRule);
		};

		const createDoc = (collection: string): Promise<string> =>
			createDocUtils({
				actor,
				collection
			});

		const createUsage = async (collection: string) => {
			const countSetDocs = 10;

			actor.setIdentity(user);

			await Promise.all(
				Array.from({ length: countSetDocs }).map(async () => await createDoc(collection))
			);

			const { doc: docDocs, usage: usageDocs } = await get_user_usage({
				collection,
				collectionType: { Db: null },
				userId: user.getPrincipal()
			});

			assertNonNullish(docDocs);
			assertNonNullish(usageDocs);

			expect(usageDocs.changes_count).toEqual(countSetDocs);

			const countUploadAssets = 5;

			actor.setIdentity(user);

			await Promise.all(
				Array.from({ length: countUploadAssets }).map(
					async (_, index) => await upload({ index, collection })
				)
			);

			const { doc: docAssets, usage: usageAssets } = await get_user_usage({
				collection,
				collectionType: { Storage: null },
				userId: user.getPrincipal()
			});

			assertNonNullish(docAssets);
			assertNonNullish(usageAssets);

			expect(usageAssets.changes_count).toEqual(countUploadAssets);
		};

		it('should delete user-usage on delete user', async () => {
			const collection = 'clean-up-doc';

			await createCollections(collection);

			await createUsage(collection);

			actor.setIdentity(user);

			const { del_doc } = actor;

			await del_doc('#user', user.getPrincipal().toText(), {
				version: [1n]
			});

			await tick(pic);

			actor.setIdentity(controller);

			const { doc: docDocs, usage: usageDocs } = await get_user_usage({
				collection,
				collectionType: { Db: null },
				userId: user.getPrincipal()
			});

			expect(docDocs).toBeUndefined();
			expect(usageDocs).toBeUndefined();

			const { doc: docAssets, usage: usageAssets } = await get_user_usage({
				collection,
				collectionType: { Storage: null },
				userId: user.getPrincipal()
			});

			expect(docAssets).toBeUndefined();
			expect(usageAssets).toBeUndefined();
		});

		it('should delete user-usage on delete many users', async () => {
			const collection = 'clean-up-many-docs';

			await createCollections(collection);

			await createUsage(collection);

			actor.setIdentity(user);

			const { del_many_docs } = actor;

			await del_many_docs([
				[
					'#user',
					user.getPrincipal().toText(),
					{
						version: [1n]
					}
				]
			]);

			await tick(pic);

			actor.setIdentity(controller);

			const { doc: docDocs, usage: usageDocs } = await get_user_usage({
				collection,
				collectionType: { Db: null },
				userId: user.getPrincipal()
			});

			expect(docDocs).toBeUndefined();
			expect(usageDocs).toBeUndefined();

			const { doc: docAssets, usage: usageAssets } = await get_user_usage({
				collection,
				collectionType: { Storage: null },
				userId: user.getPrincipal()
			});

			expect(docAssets).toBeUndefined();
			expect(usageAssets).toBeUndefined();
		});
	});
});

import type {
	ListParams,
	_SERVICE as SatelliteActor,
	SetDbConfig,
	SetRule
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import {
	JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY,
	JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_FOUND,
	JUNO_ERROR_MEMORY_HEAP_EXCEEDED,
	JUNO_ERROR_MEMORY_STABLE_EXCEEDED,
	JUNO_ERROR_NO_VERSION_PROVIDED,
	JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE
} from '@junobuild/errors';
import { nanoid } from 'nanoid';
import { inject } from 'vitest';
import { mockData } from '../../../mocks/doc.mocks';
import { createDoc as createDocUtils } from '../../../utils/satellite-doc-tests.utils';
import { controllersInitArgs, SATELLITE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
	'Satellite > Datastore',
	({ memory }) => {
		let pic: PocketIc;
		let actor: Actor<SatelliteActor>;

		const controller = Ed25519KeyIdentity.generate();

		const TEST_COLLECTION = 'test';

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

			const setRule: SetRule = {
				memory: toNullable(memory),
				max_size: toNullable(),
				max_capacity: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable(),
				rate_config: toNullable(),
				max_changes_per_user: toNullable()
			};

			const { set_rule } = actor;
			await set_rule({ Db: null }, TEST_COLLECTION, setRule);
		});

		afterAll(async () => {
			await pic?.tearDown();
		});

		const createDoc = (): Promise<string> =>
			createDocUtils({
				actor,
				collection: TEST_COLLECTION
			});

		describe('user (part 1)', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			it('should set few documents', async () => {
				const keys = await Promise.all(Array.from({ length: 10 }).map(createDoc));

				expect(keys).toHaveLength(10);
			});

			it('should get documents', async () => {
				const keys = await Promise.all(Array.from({ length: 10 }).map(createDoc));

				const { get_doc } = actor;

				const docs = await Promise.all(keys.map((key) => get_doc(TEST_COLLECTION, key)));

				for (const d of docs) {
					const doc = fromNullable(d);

					expect(doc).not.toBeUndefined();

					expect(doc?.updated_at).not.toBeUndefined();
					expect(doc?.updated_at).toBeGreaterThan(0n);
					expect(doc?.created_at).not.toBeUndefined();
					expect(doc?.created_at).toBeGreaterThan(0n);

					expect(doc?.owner.toText()).toEqual(user.getPrincipal().toText());
					expect(doc?.data).toEqual(mockData);
				}
			});

			it('should delete documents', async () => {
				const keys = await Promise.all(Array.from({ length: 10 }).map(createDoc));

				const { get_doc, del_doc } = actor;

				const delDoc = async (key: string): Promise<undefined> => {
					const doc = await get_doc(TEST_COLLECTION, key);
					return del_doc(TEST_COLLECTION, key, {
						version: fromNullable(doc)?.version ?? []
					});
				};

				const results = await Promise.all(keys.map(delDoc));

				expect(results).toHaveLength(10);
			});

			it('should update a document', async () => {
				const key = await createDoc();

				const { get_doc, set_doc } = actor;

				const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

				assertNonNullish(doc);

				await pic.advanceTime(100);

				const updatedDoc = await set_doc(TEST_COLLECTION, key, {
					...doc,
					version: doc.version
				});

				expect(updatedDoc.updated_at).toBeGreaterThan(doc.updated_at);
			});

			it('should not update a document if no version', async () => {
				const key = await createDoc();

				const { get_doc, set_doc } = actor;

				const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

				assertNonNullish(doc);

				await pic.advanceTime(100);

				await expect(
					set_doc(TEST_COLLECTION, key, {
						...doc,
						version: []
					})
				).rejects.toThrow(JUNO_ERROR_NO_VERSION_PROVIDED);
			});

			it('should not update a document if invalid version', async () => {
				const key = await createDoc();

				const { get_doc, set_doc } = actor;

				const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

				assertNonNullish(doc);

				await pic.advanceTime(100);

				await expect(
					set_doc(TEST_COLLECTION, key, {
						...doc,
						version: [123n]
					})
				).rejects.toThrow(new RegExp(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE, 'i'));
			});
		});

		describe('controller', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should delete all documents', async () => {
				const { del_docs, count_collection_docs } = actor;

				await del_docs(TEST_COLLECTION);

				const count = await count_collection_docs(TEST_COLLECTION);

				expect(count).toBe(0n);
			});

			it('should have empty config per default', async () => {
				const { get_db_config } = actor;

				const config = await get_db_config();

				expect(config).toEqual([]);
			});

			it('should set db config', async () => {
				const { set_db_config, get_db_config } = actor;

				const config: SetDbConfig = {
					max_memory_size: [
						{
							heap: [1234n],
							stable: [789n]
						}
					],
					version: []
				};

				await set_db_config(config);

				const result = fromNullable(await get_db_config());

				assertNonNullish(result);

				expect(fromNullable(result.updated_at)).not.toBeUndefined();
				expect(fromNullable(result.updated_at)).toBeGreaterThan(0n);
				expect(fromNullable(result.created_at)).not.toBeUndefined();
				expect(fromNullable(result.created_at)).toBeGreaterThan(0n);

				expect(result.version).toEqual(toNullable(1n));

				expect(result.max_memory_size).toEqual(config.max_memory_size);

				// Redo for next test
				await set_db_config({
					max_memory_size: [],
					version: [1n]
				});
			});

			it('should not set db config if incorrect version', async () => {
				const { set_db_config } = actor;

				await expect(
					set_db_config({
						max_memory_size: [],
						version: [1n]
					})
				).rejects.toThrow(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE);

				await expect(
					set_db_config({
						max_memory_size: [],
						version: [99n]
					})
				).rejects.toThrow(JUNO_ERROR_VERSION_OUTDATED_OR_FUTURE);

				await expect(
					set_db_config({
						max_memory_size: [],
						version: []
					})
				).rejects.toThrow(JUNO_ERROR_NO_VERSION_PROVIDED);
			});
		});

		describe('user (part 2)', () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(async () => {
				actor.setIdentity(user);

				for (const _ of Array.from({ length: 10 })) {
					await createDoc();
					await pic.advanceTime(100);
				}
			});

			it('should list documents according created_at timestamps', async () => {
				const { list_docs, count_docs } = actor;

				const paramsCreatedAt: ListParams = {
					matcher: toNullable(),
					order: toNullable({
						desc: false,
						field: { CreatedAt: null }
					}),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length, items } = await list_docs(TEST_COLLECTION, paramsCreatedAt);

				expect(items_length).toBe(10n);

				const countCreatedAt = await count_docs(TEST_COLLECTION, paramsCreatedAt);

				expect(countCreatedAt).toBe(10n);

				const paramsGreaterThan: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						created_at: toNullable({
							GreaterThan: items[4][1].created_at
						}),
						updated_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_from } = await list_docs(
					TEST_COLLECTION,
					paramsGreaterThan
				);

				expect(items_length_from).toBe(5n);

				const countGreaterThan = await count_docs(TEST_COLLECTION, paramsGreaterThan);

				expect(countGreaterThan).toBe(5n);

				const paramsLessThen: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						created_at: toNullable({
							LessThan: items[4][1].created_at
						}),
						updated_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_to } = await list_docs(TEST_COLLECTION, paramsLessThen);

				expect(items_length_to).toBe(4n);

				const countLessThan = await count_docs(TEST_COLLECTION, paramsLessThen);

				expect(countLessThan).toBe(4n);

				const paramsBetween: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						created_at: toNullable({
							Between: [items[4][1].created_at, items[8][1].created_at]
						}),
						updated_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_between } = await list_docs(
					TEST_COLLECTION,
					paramsBetween
				);

				expect(items_length_between).toBe(5n);

				const countBetween = await count_docs(TEST_COLLECTION, paramsBetween);

				expect(countBetween).toBe(5n);
			});

			it('should list documents according updated_at timestamps', async () => {
				const { list_docs, count_docs } = actor;

				const paramsUpdatedAt: ListParams = {
					matcher: toNullable(),
					order: toNullable({
						desc: false,
						field: { UpdatedAt: null }
					}),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length, items } = await list_docs(TEST_COLLECTION, paramsUpdatedAt);

				expect(items_length).toBe(10n);

				const countUpdatedAt = await count_docs(TEST_COLLECTION, paramsUpdatedAt);

				expect(countUpdatedAt).toBe(10n);

				const paramsGreaterThan: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						updated_at: toNullable({
							GreaterThan: items[4][1].created_at
						}),
						created_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_from } = await list_docs(
					TEST_COLLECTION,
					paramsGreaterThan
				);

				expect(items_length_from).toBe(5n);

				const countGreaterThan = await count_docs(TEST_COLLECTION, paramsGreaterThan);

				expect(countGreaterThan).toBe(5n);

				const paramsLessThan: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						updated_at: toNullable({
							LessThan: items[4][1].created_at
						}),
						created_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_to } = await list_docs(TEST_COLLECTION, paramsLessThan);

				expect(items_length_to).toBe(4n);

				const countLessThan = await count_docs(TEST_COLLECTION, paramsLessThan);

				expect(countLessThan).toBe(4n);

				const paramsBetween: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						updated_at: toNullable({
							Between: [items[4][1].created_at, items[8][1].created_at]
						}),
						created_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const { items_length: items_length_between } = await list_docs(
					TEST_COLLECTION,
					paramsBetween
				);

				expect(items_length_between).toBe(5n);

				const countBetween = await count_docs(TEST_COLLECTION, paramsBetween);

				expect(countBetween).toBe(5n);
			});
		});

		describe('user (part 3 - delete filtered docs)', () => {
			const user1 = Ed25519KeyIdentity.generate();
			const user2 = Ed25519KeyIdentity.generate();

			beforeAll(async () => {
				actor.setIdentity(controller);

				// Clean up collection before starting putting data and asserting
				const { del_docs } = actor;
				await del_docs(TEST_COLLECTION);

				actor.setIdentity(user1);
			});

			it('should delete documents matching filter criteria', async () => {
				const { list_docs, del_filtered_docs, count_docs } = actor;

				for (const _ of Array.from({ length: 10 })) {
					await createDoc();
					await pic.advanceTime(100);
				}

				// Define filter criteria for deletion
				const filterParams: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						created_at: toNullable({
							GreaterThan: 0n
						}),
						updated_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const initialCount = await count_docs(TEST_COLLECTION, filterParams);

				expect(initialCount).toBe(10n);

				await del_filtered_docs(TEST_COLLECTION, filterParams);

				const finalCount = await count_docs(TEST_COLLECTION, filterParams);

				expect(finalCount).toBe(0n);

				const { items_length } = await list_docs(TEST_COLLECTION, filterParams);

				expect(items_length).toBe(0n);
			});

			it('should delete only documents matching the exact filter criteria', async () => {
				const { del_filtered_docs, count_docs, set_doc } = actor;

				for (let i = 0; i < 5; i++) {
					const key = nanoid();
					await set_doc(TEST_COLLECTION, key, {
						data: mockData,
						description: toNullable(),
						version: toNullable()
					});
					await pic.advanceTime(50);
				}

				const filterParamsSpecific: ListParams = {
					matcher: toNullable({
						key: toNullable(),
						description: toNullable(),
						created_at: toNullable({
							GreaterThan: 100n
						}),
						updated_at: toNullable()
					}),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				const initialSpecificCount = await count_docs(TEST_COLLECTION, filterParamsSpecific);

				expect(initialSpecificCount).toBe(5n);

				await del_filtered_docs(TEST_COLLECTION, filterParamsSpecific);

				const finalSpecificCount = await count_docs(TEST_COLLECTION, filterParamsSpecific);

				expect(finalSpecificCount).toBe(0n);
			});

			it('should delete only own documents', async () => {
				actor.setIdentity(user1);

				for (const _ of Array.from({ length: 5 })) {
					await createDoc();
					await pic.advanceTime(50);
				}

				actor.setIdentity(user2);

				for (const _ of Array.from({ length: 6 })) {
					await createDoc();
					await pic.advanceTime(50);
				}

				const { list_docs, del_filtered_docs, count_collection_docs, count_docs } = actor;

				const filterParams: ListParams = {
					matcher: toNullable(),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				};

				actor.setIdentity(controller);

				const initialCount = await count_collection_docs(TEST_COLLECTION);

				expect(initialCount).toBe(11n);

				actor.setIdentity(user1);

				await del_filtered_docs(TEST_COLLECTION, filterParams);

				const finalCount = await count_docs(TEST_COLLECTION, filterParams);

				expect(finalCount).toBe(0n);

				const { items_length } = await list_docs(TEST_COLLECTION, filterParams);

				expect(items_length).toBe(0n);

				actor.setIdentity(controller);

				const updatedCount = await count_collection_docs(TEST_COLLECTION);

				expect(updatedCount).toBe(6n);
			});

			it('should delete documents with pagination', async () => {
				const { del_filtered_docs, count_docs, list_docs } = actor;

				actor.setIdentity(user2);

				const filterList: ListParams = {
					matcher: toNullable(),
					order: toNullable({
						desc: true,
						field: { Keys: null }
					}),
					owner: toNullable(),
					paginate: toNullable()
				};

				const docs = await list_docs(TEST_COLLECTION, filterList);

				expect(docs.items_length).toBe(6n);

				// eslint-disable-next-line prefer-destructuring
				const firstKey = docs.items[0][0];

				const filterDelete: ListParams = {
					matcher: toNullable(),
					order: toNullable({
						desc: true,
						field: { Keys: null }
					}),
					owner: toNullable(),
					paginate: toNullable({
						start_after: [firstKey],
						limit: [4n]
					})
				};

				await del_filtered_docs(TEST_COLLECTION, filterDelete);

				const finalSpecificCount = await count_docs(TEST_COLLECTION, filterList);

				expect(finalSpecificCount).toBe(2n);
			});
		});

		describe('rules', () => {
			const setRule: Omit<SetRule, 'max_capacity'> = {
				memory: toNullable(memory),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable(),
				rate_config: toNullable(),
				max_changes_per_user: toNullable()
			};

			beforeAll(() => {
				actor.setIdentity(controller);
			});

			const testItemsLength = async ({
				setLength,
				expectedLength,
				collection
			}: {
				setLength: number;
				expectedLength: number;
				collection: string;
			}) => {
				const { list_docs, set_many_docs } = actor;

				await set_many_docs(
					Array.from({ length: setLength }).map(() => [
						collection,
						nanoid(),
						{
							data: mockData,
							description: toNullable(),
							version: toNullable()
						}
					])
				);

				const docs = await list_docs(collection, {
					matcher: toNullable(),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				});

				expect(docs.items_length).toEqual(BigInt(expectedLength));
			};

			it('should set documents without capacity limit', async () => {
				const { set_rule } = actor;

				const COLLECTION = 'test_no_capacity_collection';
				const MAX_CAPACITY = 2;

				await set_rule({ Db: null }, COLLECTION, {
					...setRule,
					max_capacity: toNullable(MAX_CAPACITY)
				});

				await testItemsLength({
					setLength: 4,
					expectedLength: MAX_CAPACITY,
					collection: COLLECTION
				});
			});

			it('should set documents up to max capacity', async () => {
				const { set_rule } = actor;

				const COLLECTION = 'test_max_capacity_collection';
				const MAX_CAPACITY = 2;

				await set_rule({ Db: null }, COLLECTION, {
					...setRule,
					max_capacity: toNullable(MAX_CAPACITY)
				});

				await testItemsLength({
					setLength: 4,
					expectedLength: MAX_CAPACITY,
					collection: COLLECTION
				});
			});

			it('should pop first', async () => {
				const { set_rule, set_many_docs, list_docs } = actor;

				const COLLECTION = 'test_pop_first_collection';
				const MAX_CAPACITY = 2;

				await set_rule({ Db: null }, COLLECTION, {
					...setRule,
					max_capacity: toNullable(MAX_CAPACITY)
				});

				const docsCreated = await set_many_docs(
					Array.from({ length: 4 }).map((_, i) => [
						COLLECTION,
						`${i}`,
						{
							data: mockData,
							description: toNullable(),
							version: toNullable()
						}
					])
				);

				const docs = await list_docs(COLLECTION, {
					matcher: toNullable(),
					order: toNullable(),
					owner: toNullable(),
					paginate: toNullable()
				});

				expect(docs.items_length).toEqual(BigInt(MAX_CAPACITY));

				expect(docs.items[0][0]).toEqual(docsCreated[2][0]);
				expect(docs.items[1][0]).toEqual(docsCreated[3][0]);
			});
		});

		describe('collection', () => {
			beforeAll(() => {
				actor.setIdentity(controller);
			});

			it('should not delete not empty collection', async () => {
				const { del_rule } = actor;

				try {
					await del_rule({ Db: null }, TEST_COLLECTION, { version: [1n] });

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain(
						`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_EMPTY} (Datastore - ${TEST_COLLECTION})`
					);
				}
			});

			it('should not set doc in unknown collection', async () => {
				const { set_doc } = actor;

				const collectionUnknown = 'unknown';

				try {
					await set_doc(collectionUnknown, nanoid(), {
						data: mockData,
						description: toNullable(),
						version: toNullable()
					});

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain(
						`${JUNO_COLLECTIONS_ERROR_COLLECTION_NOT_FOUND} (Datastore - ${collectionUnknown})`
					);
				}
			});
		});

		describe('config', () => {
			const setRule: SetRule = {
				memory: toNullable(memory),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable(),
				max_capacity: toNullable(),
				rate_config: toNullable(),
				max_changes_per_user: toNullable()
			};

			beforeAll(() => {
				actor.setIdentity(controller);
			});

			describe.each([
				{
					memory: { Heap: null },
					expectMemory: 3_932_160n
				},
				{
					memory: { Stable: null },
					expectMemory: 50_397_184n
				}
			])('With collection', ({ memory, expectMemory }) => {
				const errorMsg = `${'Heap' in memory ? JUNO_ERROR_MEMORY_HEAP_EXCEEDED : JUNO_ERROR_MEMORY_STABLE_EXCEEDED} (${expectMemory} bytes used, 20000 bytes allowed)`;

				const collection = `test_config_${'Heap' in memory ? 'heap' : 'stable'}`;

				beforeAll(async () => {
					actor.setIdentity(controller);

					const { set_rule, set_db_config } = actor;

					await set_rule({ Db: null }, collection, setRule);

					await set_db_config({
						max_memory_size: toNullable({
							heap: 'Heap' in memory ? [20_000n] : [],
							stable: 'Stable' in memory ? [20_000n] : []
						}),
						version: ['Heap' in memory ? 2n : 3n]
					});
				});

				it('should not allow to set a document', async () => {
					await expect(createDoc()).rejects.toThrow(
						expect.objectContaining({
							message: expect.stringContaining(errorMsg)
						})
					);
				});

				it('should not allow to set many documents', async () => {
					const { set_many_docs } = actor;

					await expect(
						set_many_docs(
							Array.from({ length: 4 }).map((_, i) => [
								collection,
								`${i}`,
								{
									data: mockData,
									description: toNullable(),
									version: toNullable()
								}
							])
						)
					).rejects.toThrow(errorMsg);
				});
			});

			it('should return config after set', async () => {
				const { set_db_config } = actor;

				const config: SetDbConfig = {
					max_memory_size: [
						{
							heap: [1234n],
							stable: [789n]
						}
					],
					version: [4n]
				};

				const result = await set_db_config(config);

				expect(result).toEqual(
					expect.objectContaining({
						...config,
						created_at: [expect.any(BigInt)],
						updated_at: [expect.any(BigInt)],
						version: [5n]
					})
				);

				expect(fromNullable(result?.updated_at ?? []) ?? 0n).toBeGreaterThan(
					fromNullable(result?.created_at ?? []) ?? 0n
				);
			});
		});
	}
);

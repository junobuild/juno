import type {
	DbConfig,
	_SERVICE as SatelliteActor,
	SetRule
} from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import {
	INVALID_VERSION_ERROR_MSG,
	NO_VERSION_ERROR_MSG
} from './constants/satellite-tests.constants';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
	'Satellite datastore',
	async ({ memory }) => {
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
				version: toNullable()
			};

			const { set_rule } = actor;
			await set_rule({ Db: null }, TEST_COLLECTION, setRule);
		});

		afterAll(async () => {
			await pic?.tearDown();
		});

		const data = await toArray({
			hello: 'World'
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

		describe('user (part 1)', async () => {
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
					expect(doc?.data).toEqual(data);
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

				await pic.advanceTime(100);

				const updatedDoc = await set_doc(TEST_COLLECTION, key, {
					...doc!,
					version: doc!.version
				});

				expect(updatedDoc.updated_at).toBeGreaterThan(doc!.updated_at);
			});

			it('should not update a document if no version', async () => {
				const key = await createDoc();

				const { get_doc, set_doc } = actor;

				const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

				await pic.advanceTime(100);

				await expect(
					set_doc(TEST_COLLECTION, key, {
						...doc!,
						version: []
					})
				).rejects.toThrow(NO_VERSION_ERROR_MSG);
			});

			it('should not update a document if invalid version', async () => {
				const key = await createDoc();

				const { get_doc, set_doc } = actor;

				const doc = fromNullable(await get_doc(TEST_COLLECTION, key));

				await pic.advanceTime(100);

				await expect(
					set_doc(TEST_COLLECTION, key, {
						...doc!,
						version: [123n]
					})
				).rejects.toThrowError(new RegExp(INVALID_VERSION_ERROR_MSG, 'i'));
			});
		});

		describe('controller', () => {
			beforeAll(async () => {
				actor.setIdentity(controller);
			});

			it('should delete all documents', async () => {
				const { del_docs, count_docs } = actor;

				await del_docs(TEST_COLLECTION);

				const count = await count_docs(TEST_COLLECTION);

				expect(count).toBe(0n);
			});

			it('should have empty config per default', async () => {
				const { get_db_config } = actor;

				const config = await get_db_config();
				expect(config).toEqual([]);
			});

			it('should set db config', async () => {
				const { set_db_config, get_db_config } = actor;

				const config: DbConfig = {
					max_memory_size: [
						{
							heap: [1234n],
							stable: [789n]
						}
					]
				};

				await set_db_config(config);

				const result = await get_db_config();
				expect(result).toEqual([config]);

				// Redo for next test
				await set_db_config({
					max_memory_size: []
				});
			});
		});

		describe('user (part 2)', async () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(async () => {
				actor.setIdentity(user);

				for (const _ of Array.from({ length: 10 })) {
					await createDoc();
					await pic.advanceTime(100);
				}
			});

			it('should list documents according created_at timestamps', async () => {
				const { list_docs } = actor;

				const { items_length, items } = await list_docs(TEST_COLLECTION, {
					matcher: toNullable(),
					order: toNullable({
						desc: false,
						field: { CreatedAt: null }
					}),
					owner: toNullable(),
					paginate: toNullable()
				});

				expect(items_length).toBe(10n);

				const { items_length: items_length_from } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_from).toBe(5n);

				const { items_length: items_length_to } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_to).toBe(4n);

				const { items_length: items_length_between } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_between).toBe(5n);
			});

			it('should list documents according updated_at timestamps', async () => {
				const { list_docs } = actor;

				const { items_length, items } = await list_docs(TEST_COLLECTION, {
					matcher: toNullable(),
					order: toNullable({
						desc: false,
						field: { UpdatedAt: null }
					}),
					owner: toNullable(),
					paginate: toNullable()
				});

				expect(items_length).toBe(10n);

				const { items_length: items_length_from } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_from).toBe(5n);

				const { items_length: items_length_to } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_to).toBe(4n);

				const { items_length: items_length_between } = await list_docs(TEST_COLLECTION, {
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
				});

				expect(items_length_between).toBe(5n);
			});
		});

		describe('rules', () => {
			const setRule: Omit<SetRule, 'max_capacity'> = {
				memory: toNullable(memory),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null },
				version: toNullable()
			};

			beforeAll(async () => {
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
							data,
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
							data,
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
			beforeAll(async () => {
				actor.setIdentity(controller);
			});

			it('should not delete not empty collection', async () => {
				const { del_rule } = actor;

				try {
					await del_rule({ Db: null }, TEST_COLLECTION, { version: [1n] });

					expect(true).toBe(false);
				} catch (error: unknown) {
					expect((error as Error).message).toContain(
						`The "${TEST_COLLECTION}" collection in Datastore is not empty.`
					);
				}
			});

			it('should not set doc in unknown collection', async () => {
				const { set_doc } = actor;

				const collectionUnknown = 'unknown';

				try {
					await set_doc(collectionUnknown, nanoid(), {
						data,
						description: toNullable(),
						version: toNullable()
					});

					expect(true).toBe(false);
				} catch (error: unknown) {
					expect((error as Error).message).toContain(
						`Collection "${collectionUnknown}" not found in Datastore.`
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
				max_capacity: toNullable()
			};

			beforeAll(async () => {
				actor.setIdentity(controller);
			});

			describe.each([
				{
					memory: { Heap: null },
					expectMemory: 3_866_624n
				},
				{
					memory: { Stable: null },
					expectMemory: 25_231_360n
				}
			])('With collection', ({ memory, expectMemory }) => {
				const errorMsg = `${'Heap' in memory ? 'Heap' : 'Stable'} memory usage exceeded: ${expectMemory} bytes used, 20000 bytes allowed.`;

				const collection = `test_config_${'Heap' in memory ? 'heap' : 'stable'}`;

				beforeAll(async () => {
					actor.setIdentity(controller);

					const { set_rule, set_db_config } = actor;

					await set_rule({ Db: null }, collection, setRule);

					await set_db_config({
						max_memory_size: toNullable({
							heap: 'Heap' in memory ? [20_000n] : [],
							stable: 'Stable' in memory ? [20_000n] : []
						})
					});
				});

				it('should not allow to set a document', async () => {
					expect(createDoc()).rejects.toThrow(errorMsg);
				});

				it('should not allow to set many documents', async () => {
					const { set_many_docs } = actor;

					expect(
						set_many_docs(
							Array.from({ length: 4 }).map((_, i) => [
								collection,
								`${i}`,
								{
									data,
									description: toNullable(),
									version: toNullable()
								}
							])
						)
					).rejects.toThrow(errorMsg);
				});
			});
		});
	}
);

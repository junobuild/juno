import type { _SERVICE as SatelliteActor, SetRule } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import { nanoid } from 'nanoid';
import { afterAll, beforeAll, describe, expect } from 'vitest';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe.each([{ memory: { Heap: null } }, { memory: { Stable: null } }])(
	'Satellite datastore',
	async ({ memory }) => {
		let pic: PocketIc;
		let actor: Actor<SatelliteActor>;

		const controller = Ed25519KeyIdentity.generate();

		const TEST_COLLECTION = 'test';

		beforeAll(async () => {
			pic = await PocketIc.create();

			const { actor: c } = await pic.setupCanister<SatelliteActor>({
				idlFactory: idlFactorSatellite,
				wasm: WASM_PATH,
				arg: satelliteInitArgs(controller),
				sender: controller.getPrincipal()
			});

			actor = c;
			actor.setIdentity(controller);

			const setRule: SetRule = {
				memory: toNullable(memory),
				updated_at: toNullable(),
				max_size: toNullable(),
				max_capacity: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null }
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

		describe('user', async () => {
			const user = Ed25519KeyIdentity.generate();

			beforeAll(() => {
				actor.setIdentity(user);
			});

			const createDoc = async (): Promise<string> => {
				const key = nanoid();

				const { set_doc } = actor;

				await set_doc(TEST_COLLECTION, key, {
					data,
					description: toNullable(),
					updated_at: toNullable()
				});

				return key;
			};

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
						updated_at: toNullable(fromNullable(doc)?.updated_at)
					});
				};

				const results = await Promise.all(keys.map(delDoc));
				expect(results).toHaveLength(10);
			});
		});

		describe('rules', () => {
			const setRule: Omit<SetRule, 'max_capacity'> = {
				memory: toNullable(memory),
				updated_at: toNullable(),
				max_size: toNullable(),
				read: { Managed: null },
				mutable_permissions: toNullable(),
				write: { Managed: null }
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
							updated_at: toNullable()
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
							updated_at: toNullable()
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
	}
);

import { idlFactorySatellite, type SatelliteActor, type SatelliteDid } from '$declarations';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { assertNonNullish, fromNullable, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { toArray } from '@junobuild/utils';
import { inject } from 'vitest';
import { SATELLITE_WASM_PATH, controllersInitArgs } from '../../../utils/setup-tests.utils';

describe('Satellite > Rate', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorySatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const initDoc = async (
		collection: string
	): Promise<{ doc: SatelliteDid.Doc; user: Identity }> => {
		const { set_doc } = actor;

		const user = Ed25519KeyIdentity.generate();
		actor.setIdentity(user);

		const doc = await set_doc(collection, user.getPrincipal().toText(), {
			data: await toArray({}),
			description: toNullable(),
			version: toNullable()
		});

		return { doc, user };
	};

	const testDocs = async ({
		length,
		collection
	}: {
		length: number;
		collection: string;
	}): Promise<{ doc: SatelliteDid.Doc; user: Identity }[]> => {
		const keys = Array.from({ length });

		const docs = [];

		for (const _ of keys) {
			const doc = await initDoc(collection);
			docs.push(doc);
		}

		return docs;
	};

	describe('user', () => {
		const config = async ({
			collection,
			collectionType,
			max_tokens
		}: {
			max_tokens: bigint;
			collection: string;
			collectionType: { Db: null } | { Storage: null };
		}) => {
			actor.setIdentity(controller);

			const { get_rule, set_rule } = actor;

			const result = await get_rule(collectionType, collection);

			const rule = fromNullable(result);

			assertNonNullish(rule);

			await set_rule(collectionType, collection, {
				...rule,
				rate_config: [
					{
						max_tokens,
						time_per_token_ns: 600_000_000n
					}
				]
			});
		};

		it('should not throw error if there is a delay', async () => {
			await testDocs({ length: 101, collection: '#user' });

			// Observed this advance time in comparison to last updated_at of 600 milliseconds
			await pic.advanceTime(200);

			await testDocs({ length: 1, collection: '#user' });
		});

		it('should throw error if user rate is reached', async () => {
			await pic.advanceTime(60600);

			try {
				// DEFAULT 100 per minutes. So 1 for very first token + 100
				await testDocs({ length: 102, collection: '#user' });

				expect(true).toBeFalsy();
			} catch (error: unknown) {
				expect((error as Error).message).toContain('Rate limit reached, try again later.');
			}
		});

		it('should set config and accept more users', async () => {
			await pic.advanceTime(60600);

			await config({
				collection: '#user',
				collectionType: { Db: null },
				max_tokens: 201n
			});

			await pic.advanceTime(600000);

			const length = 201;

			const docs = await testDocs({ length, collection: '#user' });

			expect(docs).toHaveLength(length);

			try {
				// One too many
				await testDocs({ length: 1, collection: '#user' });

				expect(true).toBeFalsy();
			} catch (error: unknown) {
				expect((error as Error).message).toContain('Rate limit reached, try again later.');
			}
		});
	});

	const config = async ({
		collection,
		collectionType,
		max_tokens
	}: {
		max_tokens: bigint | undefined;
		collection: string;
		collectionType: { Db: null } | { Storage: null };
	}) => {
		actor.setIdentity(controller);

		const { set_rule, get_rule } = actor;

		const result = await get_rule(collectionType, collection);
		const rule = fromNullable(result);

		await set_rule(collectionType, collection, {
			memory: nonNullish(rule) ? rule.memory : toNullable(),
			max_size: toNullable(),
			max_capacity: toNullable(),
			max_changes_per_user: toNullable(),
			read: { Public: null },
			mutable_permissions: toNullable(true),
			write: { Public: null },
			version: nonNullish(rule) ? rule.version : toNullable(),
			rate_config: isNullish(max_tokens)
				? []
				: [
						{
							max_tokens,
							time_per_token_ns: 600_000_000n
						}
					]
		});
	};

	describe('datastore', () => {
		const collectionType = { Db: null };
		const collection = 'test_db_values';

		describe('set', () => {
			beforeAll(async () => {
				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});
			});

			it('should not throw error if there is a delay', async () => {
				await testDocs({ length: 9, collection });

				// Observed this advance time in comparison to last updated_at of 600 milliseconds
				await pic.advanceTime(200);

				await testDocs({ length: 1, collection });
			});

			it('should throw error if user rate is reached', async () => {
				await pic.advanceTime(60600);

				try {
					await testDocs({ length: 11, collection });

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain('Rate limit reached, try again later.');
				}
			});
		});

		describe('delete', () => {
			beforeEach(async () => {
				await config({
					collection,
					collectionType,
					max_tokens: undefined
				});
			});

			const deleteDocs = async (docs: { doc: SatelliteDid.Doc; user: Identity }[]) => {
				const { del_doc } = actor;

				for (const doc of docs) {
					actor.setIdentity(doc.user);

					await del_doc(collection, doc.user.getPrincipal().toText(), doc.doc);
				}
			};

			it('should not throw error if there is a delay', async () => {
				const docs = await testDocs({ length: 10, collection });

				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});

				await pic.advanceTime(60600);

				const [last, ...rest] = docs.reverse();

				await deleteDocs(rest);

				// Observed this advance time in comparison to last updated_at of 600 milliseconds
				await pic.advanceTime(200);

				await deleteDocs([last]);
			});

			it('should throw error if user rate is reached', async () => {
				await pic.advanceTime(60600);

				const docs = await testDocs({ length: 12, collection });

				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});

				try {
					await deleteDocs(docs);

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain('Rate limit reached, try again later.');
				}
			});
		});
	});

	describe('storage', () => {
		const collectionType = { Storage: null };
		const collection = 'test_storage_values';

		const initBatch = async (
			i: number
		): Promise<{ batch: SatelliteDid.InitUploadResult; user: Identity }> => {
			const { init_asset_upload } = actor;

			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			const batch = await init_asset_upload({
				collection,
				description: toNullable(),
				encoding_type: [],
				full_path: `/${collection}/hello${i}.html`,
				name: `hello${i}.html`,
				token: toNullable()
			});

			return { batch, user };
		};

		const testBatches = async (
			length: number
		): Promise<{ batch: SatelliteDid.InitUploadResult; user: Identity }[]> => {
			const keys = Array.from({ length }).map((_, i) => i);

			const batches = [];

			for (const key of keys) {
				const batch = await initBatch(key);
				batches.push(batch);
			}

			return batches;
		};

		describe('batch', () => {
			beforeAll(async () => {
				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});
			});

			it('should not throw error if there is a delay', async () => {
				await testBatches(9);

				// Observed this advance time in comparison to last updated_at of 600 milliseconds
				await pic.advanceTime(200);

				await testBatches(1);
			});

			it('should throw error if user rate is reached', async () => {
				await pic.advanceTime(60600);

				try {
					await testBatches(11);

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain('Rate limit reached, try again later.');
				}
			});
		});

		describe('chunk', () => {
			beforeEach(async () => {
				await config({
					collection,
					collectionType,
					max_tokens: undefined
				});
			});

			const testChunks = async (
				batches: { batch: SatelliteDid.InitUploadResult; user: Identity }[]
			) => {
				const { upload_asset_chunk, commit_asset_upload } = actor;

				for (const batch of batches) {
					actor.setIdentity(batch.user);

					const chunk = await upload_asset_chunk({
						batch_id: batch.batch.batch_id,
						content: [],
						order_id: [0n]
					});

					await commit_asset_upload({
						batch_id: batch.batch.batch_id,
						chunk_ids: [chunk.chunk_id],
						headers: []
					});
				}
			};

			it('should not throw error if there is a delay', async () => {
				const batches = await testBatches(10);

				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});

				await pic.advanceTime(60600);

				const [last, ...rest] = batches.reverse();

				await testChunks(rest);

				// Observed this advance time in comparison to last updated_at of 600 milliseconds
				await pic.advanceTime(200);

				await testChunks([last]);
			});

			it('should throw error if user rate is reached', async () => {
				await pic.advanceTime(60600);

				const batches = await testBatches(11);

				await config({
					collection,
					collectionType,
					max_tokens: 10n
				});

				try {
					await testChunks(batches);

					expect(true).toBeFalsy();
				} catch (error: unknown) {
					expect((error as Error).message).toContain('Rate limit reached, try again later.');
				}
			});
		});
	});
});

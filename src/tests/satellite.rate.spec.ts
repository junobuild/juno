import type { Doc, _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { fromNullable, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { assertNonNullish, toArray } from '@junobuild/utils';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { SATELLITE_WASM_PATH, controllersInitArgs } from './utils/setup-tests.utils';

describe('Satellite rate', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: SATELLITE_WASM_PATH,
			arg: controllersInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const initDoc = async (collection: string): Promise<Doc> => {
		const { set_doc } = actor;

		const user = Ed25519KeyIdentity.generate();
		actor.setIdentity(user);

		const doc = await set_doc(collection, user.getPrincipal().toText(), {
			data: await toArray({}),
			description: toNullable(),
			version: toNullable()
		});

		return doc;
	};

	const testDocs = async ({
		length,
		collection
	}: {
		length: number;
		collection: string;
	}): Promise<number> => {
		const keys = Array.from({ length });

		const docs = [];

		for (const _ of keys) {
			const doc = await initDoc(collection);
			docs.push(doc);
		}

		return docs.length;
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

				expect(true).toBe(false);
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

			const count = await testDocs({ length, collection: '#user' });

			expect(count).toBe(length);

			try {
				// One too many
				await testDocs({ length: 1, collection: '#user' });

				expect(true).toBe(false);
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
		max_tokens: bigint;
		collection: string;
		collectionType: { Db: null } | { Storage: null };
	}) => {
		actor.setIdentity(controller);

		const { set_rule } = actor;

		await set_rule(collectionType, collection, {
			memory: toNullable(),
			max_size: toNullable(),
			max_capacity: toNullable(),
			read: { Managed: null },
			mutable_permissions: toNullable(true),
			write: { Managed: null },
			version: toNullable(),
			rate_config: [
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

		it('should not throw error if there is a delay', async () => {
			await config({
				collection,
				collectionType,
				max_tokens: 10n
			});

			await testDocs({ length: 9, collection });

			// Observed this advance time in comparison to last updated_at of 600 milliseconds
			await pic.advanceTime(200);

			await testDocs({ length: 1, collection });
		});

		it('should throw error if user rate is reached', async () => {
			await pic.advanceTime(60600);

			try {
				await testDocs({ length: 11, collection });

				expect(true).toBe(false);
			} catch (error: unknown) {
				expect((error as Error).message).toContain('Rate limit reached, try again later.');
			}
		});
	});
});

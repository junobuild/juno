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

	describe('user', () => {
		const initUser = async (): Promise<Doc> => {
			const { set_doc } = actor;

			const user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			const doc = await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				version: toNullable()
			});

			return doc;
		};

		const testUsers = async (length: number): Promise<number> => {
			const keys = Array.from({ length });

			const docs = [];

			for (const _ of keys) {
				const doc = await initUser();
				docs.push(doc);
			}

			return docs.length;
		};

		it('should not throw error if there is a delay', async () => {
			await testUsers(101);

			// Observed this advance time in comparison to last updated_at of 600 milliseconds
			await pic.advanceTime(200);

			await testUsers(1);
		});

		it('should throw error if user rate is reached', async () => {
			await pic.advanceTime(60600);

			try {
				// DEFAULT 100 per minutes. So 1 for very first token + 100
				await testUsers(102);

				expect(true).toBe(false);
			} catch (error: unknown) {
				expect((error as Error).message).toContain('Rate limit reached, try again later.');
			}
		});

		it('should set config and accept more users', async () => {
			await pic.advanceTime(60600);

			actor.setIdentity(controller);

			const { get_rule, set_rule } = actor;

			const result = await get_rule({ Db: null }, '#user');

			const rule = fromNullable(result);

			assertNonNullish(rule);

			await set_rule({ Db: null }, '#user', {
				...rule,
				rate_config: [
					{
						max_tokens: 201n,
						time_per_token_ns: 600_000_000n
					}
				]
			});

			await pic.advanceTime(600000);

			const length = 201;

			const count = await testUsers(length);

			expect(count).toBe(length);

			try {
				// One too many
				await testUsers(1);

				expect(true).toBe(false);
			} catch (error: unknown) {
				expect((error as Error).message).toContain('Rate limit reached, try again later.');
			}
		});
	});
});

import type { Doc, _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
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

	it('should throw error if user rate is reached', async () => {
		const length = 13;

		const keys = Array.from({ length });

		const docs = [];

		try {
			for (const _ of keys) {
				const doc = await initUser();
				docs.push(doc);

				await pic.advanceTime(60000 / length);
			}

			expect(docs).toHaveLength(length);
		} catch (error: unknown) {
			expect((error as Error).message).toContain('Rate limit reached, try again later.');
		}
	});
});

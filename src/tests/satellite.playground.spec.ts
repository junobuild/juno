import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { toArray } from '@junobuild/utils';
import {afterAll, beforeAll, beforeEach, describe, inject} from 'vitest';
import { WASM_PATH, satelliteInitArgs } from './utils/satellite-tests.utils';

describe.skip('Satellite playground (kind of)', () => {
	let pic: PocketIc;
	let actor: Actor<SatelliteActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<SatelliteActor>({
			idlFactory: idlFactorSatellite,
			wasm: WASM_PATH,
			arg: satelliteInitArgs(controller),
			sender: controller.getPrincipal()
		});

		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	beforeEach(() => {
		actor.setIdentity(controller);
	});

	it('should create lots of users', async () => {
		const { set_doc, list_docs } = actor;

		const createUser = async (counter: number): Promise<void> => {
			const user = Ed25519KeyIdentity.generate();

			await set_doc('#user', user.getPrincipal().toText(), {
				data: await toArray({
					provider: 'internet_identity'
				}),
				description: toNullable(),
				updated_at: toNullable()
			});

			console.log(`[${counter}] User ${user.getPrincipal().toText()} created.`);
		};

		const chunks = 500;

		for (let i = 0; i < 25; i++) {
			await Promise.allSettled(
				Array.from({ length: chunks }).map((_, count) => createUser(i * chunks + count))
			);

			await pic.tick(100);
		}

		const { items: users } = await list_docs('#user', {
			matcher: toNullable(),
			order: toNullable(),
			owner: toNullable(),
			paginate: toNullable()
		});

		console.log(users);
	}, 2000000); // 451569 for 5000 with 100 create user in promise
});

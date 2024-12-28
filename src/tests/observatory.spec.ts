import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CALLER_NOT_CONTROLLER_OBSERVATORY_MSG } from './constants/observatory-tests.constants';
import { OBSERVATORY_WASM_PATH } from './utils/setup-tests.utils';

describe('Observatory', () => {
	let pic: PocketIc;
	let actor: Actor<ObservatoryActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactorObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw errors on set controllers', async () => {
			const { set_controllers } = actor;

			await expect(
				set_controllers({
					controller: {
						scope: { Admin: null },
						metadata: [],
						expires_at: []
					},
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});

		it('should throw errors on delete controllers', async () => {
			const { del_controllers } = actor;

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(CALLER_NOT_CONTROLLER_OBSERVATORY_MSG);
		});
	});
});

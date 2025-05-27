import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { beforeAll, describe, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Controllers', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertControllers = (actor: () => ConsoleActor) => {
		it('should throw errors on creating controller', async () => {
			const { set_controllers } = actor();

			const controller = Ed25519KeyIdentity.generate();

			await expect(
				set_controllers({
					controllers: [controller.getPrincipal()],
					controller: {
						expires_at: toNullable(),
						metadata: [],
						scope: { Admin: null }
					}
				})
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on list controllers', async () => {
			const { list_controllers } = actor();

			await expect(list_controllers()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on deleting controller', async () => {
			const { del_controllers } = actor();

			await expect(
				del_controllers({
					controllers: [controller.getPrincipal()]
				})
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	};

	describe('Anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertControllers(() => actor);
	});

	describe('Some user', () => {
		const user = Ed25519KeyIdentity.generate();

		beforeAll(() => {
			actor.setIdentity(user);
		});

		assertControllers(() => actor);
	});
});

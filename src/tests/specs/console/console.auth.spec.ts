import { type ConsoleActor, idlFactoryConsole } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { testAuthConfig, testReturnAuthConfig } from '../../utils/auth-assertions-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Storage', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('admin', () => {
		beforeAll(() => {
			actor.setIdentity(controller);
		});

		testAuthConfig({
			actor: () => actor
		});

		testReturnAuthConfig({
			actor: () => actor,
			pic: () => pic,
			canisterId: () => canisterId,
			controller: () => controller,
			version: 4n
		});

		// TODO: commented until init salt is implemented
		// testAuthGoogleConfig({
		// 	actor: () => actor,
		// 	pic: () => pic,
		// 	canisterId: () => canisterId,
		// 	controller: () => controller,
		// 	version: 5n
		// });
	});
});

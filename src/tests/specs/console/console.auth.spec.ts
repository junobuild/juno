import { type ConsoleActor, idlFactoryConsole } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import { inject } from 'vitest';
import { testAuthConfig, testReturnAutConfig } from '../../utils/auth-assertions-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Storage', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
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

		testReturnAutConfig({
			actor: () => actor,
			version: 4n
		});
	});
});

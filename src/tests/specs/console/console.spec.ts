import { idlFactoryConsole, type ConsoleActor } from '$declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { inject } from 'vitest';
import { deploySegments, initMissionControls } from '../../utils/console-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments({ actor });
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should throw errors if too many users are created quickly', async () => {
		await expect(async () => await initMissionControls({ actor, pic, length: 2 })).rejects.toThrow(
			new RegExp('Rate limit reached, try again later', 'i')
		);
	});
});

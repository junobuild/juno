import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { testAuthUpgrade } from '../../../utils/auth-assertions-upgrade-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../../utils/auth-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { CONSOLE_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Console > Auth', () => {
	let pic: PocketIc;

	let observatoryId: Principal;

	let controller: Ed25519KeyIdentity;

	let consoleActor: Actor<ConsoleActor>;
	let consoleId: Principal;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor: sActor, canisterId: sId },
			observatory: { canisterId: oId },
			session: s,
			controller: c
		} = await setupConsoleAuth();

		pic = p;

		consoleActor = sActor;
		consoleId = sId;
		observatoryId = oId;

		controller = c;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId: consoleId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	testAuthUpgrade({
		pic: () => pic,
		actor: () => consoleActor,
		controller: () => controller,
		session: () => session,
		observatoryId: () => observatoryId,
		upgrade
	});
});

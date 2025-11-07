import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { testAuthTargets } from '../../../utils/auth-assertions-targets-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../../utils/auth-tests.utils';

describe('Console > Auth', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let consoleId: Principal;
	let consoleActor: Actor<ConsoleActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor, canisterId: cId },
			session: s,
			controller: c
		} = await setupConsoleAuth();

		pic = p;

		controller = c;

		consoleActor = actor;
		consoleId = cId;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthTargets({
		pic: () => pic,
		actor: () => consoleActor,
		canisterId: () => consoleId,
		controller: () => controller,
		session: () => session
	});
});

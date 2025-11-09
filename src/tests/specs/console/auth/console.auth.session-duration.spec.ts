import type { ConsoleActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { testAuthSessionDuration } from '../../../utils/auth-assertions-session-duration-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../../utils/auth-tests.utils';

describe('Console > Auth', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let consoleActor: Actor<ConsoleActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor },
			testSatellite: { actor: tActor },
			session: s,
			controller: cO
		} = await setupConsoleAuth();

		pic = p;
		consoleActor = actor;
		testSatelliteActor = tActor;

		session = s;

		controller = cO;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthSessionDuration({
		pic: () => pic,
		actor: () => consoleActor,
		controller: () => controller,
		session: () => session,
		testSatelliteActor: () => testSatelliteActor
	});
});

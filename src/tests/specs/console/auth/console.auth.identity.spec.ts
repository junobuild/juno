import type { ConsoleActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	assertIdentity,
	authenticateAndMakeIdentity
} from '../../../utils/auth-identity-tests.utils';
import { setupConsoleAuth, type TestSession } from '../../../utils/auth-tests.utils';

describe('Satellite > Auth > Delegation identity', () => {
	let pic: PocketIc;

	let consoleActor: Actor<ConsoleActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			console: { actor },
			testSatellite: { actor: tActor },
			session: s
		} = await setupConsoleAuth();

		pic = p;
		consoleActor = actor;
		testSatelliteActor = tActor;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should authenticate, get delegation and use identity to perform a call', async () => {
		const { identity } = await authenticateAndMakeIdentity({
			pic,
			session,
			actor: consoleActor
		});

		await assertIdentity({
			testSatelliteActor,
			identity
		});
	});
});

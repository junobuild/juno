import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { testAuthSessionDuration } from '../../../../utils/auth-assertions-session-duration-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';

describe('Satellite > Auth', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			testSatellite: { actor: tActor },
			session: s,
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		satelliteActor = actor;
		testSatelliteActor = tActor;

		controller = c;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthSessionDuration({
		pic: () => pic,
		actor: () => satelliteActor,
		controller: () => controller,
		session: () => session,
		testSatelliteActor: () => testSatelliteActor
	});
});

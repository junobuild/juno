import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	assertIdentity,
	authenticateAndMakeIdentity
} from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > Delegation identity', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			testSatellite: { actor: tActor },
			session: s
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;
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
			satelliteActor
		});

		await assertIdentity({
			testSatelliteActor,
			identity
		});
	});
});

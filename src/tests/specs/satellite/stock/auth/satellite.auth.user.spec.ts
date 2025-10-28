import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromArray } from '@junobuild/utils';
import { authenticateAndMakeIdentity } from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > User', () => {
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

	it('should register a new user', async () => {
		const { identity, user } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
		});

		expect(user.owner.toText()).toEqual(identity.getPrincipal().toText());

		const data = await fromArray(user.data);

		expect(data).toEqual({
			provider: 'google',
			banned: null,
			providerData: {
				google: {
					email: 'user@example.com',
					name: 'Hello World',
					givenName: 'Hello',
					familyName: 'World',
					picture: null,
					locale: null
				}
			}
		});
	});
});

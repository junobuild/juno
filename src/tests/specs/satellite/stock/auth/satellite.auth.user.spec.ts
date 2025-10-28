import type { SatelliteActor } from '$declarations';
import type { _SERVICE as TestSatelliteActor } from '$test-declarations/test_satellite/test_satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromArray } from '@junobuild/utils';
import { authenticateAndMakeIdentity } from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/satellite-auth-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import type { Principal } from '@dfinity/principal';
import { DelegationIdentity } from '@dfinity/identity';

describe('Satellite > Auth > User', () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;
	let testSatelliteActor: Actor<TestSatelliteActor>;

	let session: TestSession;

	let mockJwt: string;
	let mockIdentity: DelegationIdentity;

	const mockUserData = {
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
	}

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
		const { identity, user, jwt } = await authenticateAndMakeIdentity({
			pic,
			session,
			satelliteActor
		});

		mockJwt = jwt;
		mockIdentity = identity;

		expect(user.owner.toText()).toEqual(identity.getPrincipal().toText());

		const data = await fromArray(user.data);
		expect(data).toEqual(mockUserData);
	});

	it('should return same user', async () => {
		await pic.advanceTime(1000 * 30); // 30s for cooldown guard
		await tick(pic);

		const { authenticate_user } = satelliteActor;

		const result = await authenticate_user({
			OpenId: {
				jwt: mockJwt,
				session_key: session.publicKey,
				salt: session.salt
			}
		});

		if (!('Ok' in result)) {
			expect(true).toBeFalsy();

			return;
		}

		const {doc: user} = result.Ok;

		expect(user.owner.toText()).toEqual(mockIdentity.getPrincipal().toText());

		const data = await fromArray(user.data);
		expect(data).toEqual(mockUserData);
	});
});

import type { SatelliteActor, SatelliteDid } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import { OBSERVATORY_ID } from '../../../../constants/observatory-tests.constants';
import { SATELLITE_ID } from '../../../../constants/satellite-tests.constants';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import { authenticateAndMakeIdentity } from '../../../../utils/auth-identity-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';
import { testAuthTargets } from '../../../../utils/auth-assertions-targets-tests.utils';

describe('Satellite > Auth', () => {
	let pic: PocketIc;

	let controller: Ed25519KeyIdentity;

	let satelliteId: Principal;
	let satelliteActor: Actor<SatelliteActor>;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor, canisterId: cId },
			session: s,
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		controller = c;

		satelliteActor = actor;
		satelliteId = cId;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthTargets({
		pic: () => pic,
		actor: () => satelliteActor,
		canisterId: () => satelliteId,
		controller: () => controller,
		session: () => session,
	})
});

import type { SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { testAuthTargets } from '../../../../utils/auth-assertions-targets-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';

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
		session: () => session
	});
});

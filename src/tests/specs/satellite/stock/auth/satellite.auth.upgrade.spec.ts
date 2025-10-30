import type { SatelliteActor } from '$declarations';
import type { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { testAuthUpgrade } from '../../../../utils/auth-assertions-upgrade-tests.utils';
import { setupSatelliteAuth, type TestSession } from '../../../../utils/auth-tests.utils';
import { upgradeSatellite } from '../../../../utils/satellite-upgrade-tests.utils';

describe('Satellite > Auth', () => {
	let pic: PocketIc;

	let observatoryId: Principal;

	let controller: Ed25519KeyIdentity;

	let satelliteActor: Actor<SatelliteActor>;
	let satelliteId: Principal;

	let session: TestSession;

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor: sActor, canisterId: sId },
			observatory: { canisterId: oId },
			session: s,
			controller: c
		} = await setupSatelliteAuth();

		pic = p;

		satelliteActor = sActor;
		satelliteId = sId;
		observatoryId = oId;

		controller = c;

		session = s;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	testAuthUpgrade({
		pic: () => pic,
		actor: () => satelliteActor,
		canisterId: () => satelliteId,
		controller: () => controller,
		session: () => session,
		observatoryId: () => observatoryId,
		upgrade: () => upgradeSatellite({ canisterId: satelliteId, pic, controller })
	});
});
